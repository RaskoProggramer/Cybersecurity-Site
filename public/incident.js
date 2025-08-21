const form = document.getElementById("incident-form");
    const successEl = document.getElementById("success");
    const errorEl = document.getElementById("error");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      successEl.style.display = "none";
      errorEl.style.display = "none";

      try {
        const fd = new FormData(form);
        const files = document.getElementById("evidence").files;
        for (const f of files) fd.append("evidence", f);

        const res = await fetch("/api/incidents", {
          method: "POST",
          body: fd
        });

        const out = await res.json();
        if (!res.ok) throw new Error(out.error || "Submission failed");

        successEl.textContent = `Incident submitted. Ticket ID: ${out.ticketId}`;
        successEl.style.display = "block";
        form.reset();
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.style.display = "block";
      }
    });