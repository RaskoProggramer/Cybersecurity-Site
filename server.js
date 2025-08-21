const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const admin = require("firebase-admin");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const nodemailer = require("nodemailer");


require("dotenv").config();
const upload = multer({ storage: multer.memoryStorage() });
const serviceAccount = require("./cybersite.json");


const app = express();
const PORT = 3000;
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const bucketName = process.env.bucketName;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: bucketName || "cybersite-1512d.appspot.com",
});

const bucket = admin.storage().bucket();
const db = admin.firestore();
db.settings({ 
  host: 'firestore.googleapis.com',
  ssl: true 
});

// Serve static files
app.use(express.static("public"));

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Threat.html"));
});
app.get("/about", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "AboutUs.html"));
});
app.get("/incidents", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "incident.html"));
});
app.get("/training", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "training.html"));
});
// app.get("/", (_req, res) => {
//   res.sendFile(path.join(__dirname, "public", "incident.html"));
// });

// Threat Alerts (CVE API)
app.get("/api/threats", async (req, res) => {
  try {
    const response = await fetch("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json");
    const data = await response.json();

    // Map to a simpler format and get latest 5
    const alerts = data.vulnerabilities.slice(0, 5).map(v => ({
      id: v.cveID,
      title: v.shortDescription || "No description available",
      severity: v.vendorProject || "Unknown",
      time: v.dateAdded
    }));

    res.json(alerts);
  } catch (err) {
    console.error("Error fetching KEV feed:", err);
    res.status(500).json({ error: "Failed to fetch KEV feed" });
  }
});

// 🔹 Weekly Bulletins (News API)
app.get("/api/bulletins", async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const fromDate = oneWeekAgo.toISOString().split("T")[0];

    const url = `https://newsapi.org/v2/everything?q=cybersecurity&from=${fromDate}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    const headlines = (data.articles || []).slice(0, 5).map(a => ({
      title: a.title,
      source: a.source.name,
      publishedAt: a.publishedAt,
      url: a.url
    }));

    res.json({ weekOf: fromDate, headlines });
  } catch (err) {
    console.error("Error fetching news:", err);
    res.status(500).json({ error: "Failed to fetch weekly bulletins" });
  }
});



app.post("/api/incidents", upload.array("evidence", 5), async (req, res) => {
  try {
    const { title, reporterEmail, description, category, severity, affectedAsset } = req.body;

    if (!title || !reporterEmail || !description) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const ticketId = uuidv4();
    const uploadedFiles = [];

    for (const file of req.files || []) {
      const filename = `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`;
      const dest = `tickets/${ticketId}/${filename}`;
      const blob = bucket.file(dest);

      await blob.save(file.buffer, {
        contentType: file.mimetype,
        metadata: { metadata: { originalName: file.originalname, reporterEmail } },
      });

      const [url] = await blob.getSignedUrl({
        action: "read",
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      uploadedFiles.push({ path: dest, originalName: file.originalname, url });
    }

    const now = admin.firestore.Timestamp.now();
    const ticketDoc = {
      ticketId,
      title,
      reporterEmail,
      description,
      category: category || "other",
      severity: (severity || "medium").toLowerCase(),
      affectedAsset: affectedAsset || "",
      status: "open",
      createdAt: now,
      updatedAt: now,
      evidence: uploadedFiles,
      source: "portal",
    };
    // notify security team
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        secure: false, // TLS is used, but secure:false for STARTTLS
        auth: {
        user: process.env.OUTLOOK_EMAIL, // your Outlook email
        pass: process.env.OUTLOOK_PASS   // your Outlook App Password
        }
      });
      
     try {
  // Email to Security Team
  await transporter.sendMail({
    from: `"Incident Reporter" <${process.env.OUTLOOK_EMAIL}>`,
    to: "rakgopempho@gmail.com", // Security team email
    subject: `[SECURITY INCIDENT] ${title} (${severity})`,
    text: `🚨 New ticket created!\n
    Title: ${title}
    Severity: ${severity}
    Category: ${category}
    Reporter: ${reporterEmail}
    Affected Asset: ${affectedAsset}
    Description: ${description}
    Ticket ID: ${ticketId}`
  });

  // Email to Reporter (confirmation)
  await transporter.sendMail({
    from: `"Incident Reporter" <${process.env.OUTLOOK_EMAIL}>`,
    to: reporterEmail, // Reporter's email
    subject: `✅ Incident Report Received - Ticket ID: ${ticketId}`,
    text: `Thank you for reporting this incident.\n\n
    We have received your report and our security team will investigate.\n
    Details:\n
    Title: ${title}
    Severity: ${severity}
    Category: ${category}
    Affected Asset: ${affectedAsset}
    Ticket ID: ${ticketId}\n\n
    Regards,\nSecurity Team`
  });

  console.log("✅ Incident emails sent successfully");
} catch (emailErr) {
  console.error("❌ Error sending incident emails:", emailErr);
}

      console.log("Email sent successfully");
      res.status(201).json({ message: "Incident reported successfully", ticketId });
    } catch (emailErr) {
      console.error("Error sending email:", emailErr);
      res.status(500).json({ emailErr: "Failed to create tickets" });
    }
  } catch (err) {
    console.error("Error creating tickets:", err);
    res.status(500).json({ error: "Failed to create tickets" });
  }
});

// ---------- Fetch single incident ----------
app.get("/api/incidents/:id", async (req, res) => {
  try {
    const snap = await db.collection("tickets").doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: "Not found" });
    res.json(snap.data());
  } catch (err) {
    console.error("Error fetching tickets:", err);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
