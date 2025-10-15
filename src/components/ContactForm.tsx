'use client';
import React, { useState } from "react";
import { motion } from "framer-motion";

const ContactForm = () => {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [formStatus, setFormStatus] = useState<
    "idle" | "success" | "error" | "submitting"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    try {
      // Create FormData object instead of using JSON
      const formData = new FormData();
      Object.entries(formState).forEach(([key, value]) => {
        formData.append(key, value);
      });
      const date = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const time = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      formData.append("date", date);
      formData.append("time", time);

      // Use fetch with form data and no Content-Type header (browser sets it automatically)
      await fetch(
        "https://script.google.com/macros/s/AKfycbwvt8y-9o2RP8OWaIkSQ6DK3-EiFmnv6jdKFdV-6kwUTa7nSvFCo8bH6vBIyKIvy7ycwQ/exec",
        {
          method: "POST",
          body: formData,
          // No headers needed - browser will set the appropriate Content-Type
          mode: "no-cors", // Use no-cors mode to avoid preflight requests
        }
      );
      // Since no-cors doesn't return readable response, assume success if no error
      setFormStatus("success");

      // Reset form after submission
      setFormState({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormStatus("error");
    }

    setTimeout(() => setFormStatus("idle"), 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card rounded-2xl shadow-lg p-8 border border-border"
    >
      <h2 className="text-3xl font-bold text-foreground mb-8">
        Send us a Message
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <input
            type="text"
            name="name"
            id="name"
            value={formState.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors duration-200 peer bg-background"
            placeholder=" "
          />
          <label
            htmlFor="name"
            className="absolute left-4 top-3 text-muted-foreground transition-all duration-200 -translate-y-7 bg-card px-2 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:bg-transparent peer-focus:-translate-y-7 peer-focus:bg-card"
          >
            Your Name
          </label>
        </div>

        <div className="relative">
          <input
            type="email"
            name="email"
            id="email"
            value={formState.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors duration-200 peer bg-background"
            placeholder=" "
          />
          <label
            htmlFor="email"
            className="absolute left-4 top-3 text-muted-foreground transition-all duration-200 -translate-y-7 bg-card px-2 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:bg-transparent peer-focus:-translate-y-7 peer-focus:bg-card"
          >
            Email Address
          </label>
        </div>

        <div className="relative">
          <select
            name="subject"
            id="subject"
            value={formState.subject}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors duration-200 bg-background text-foreground"
          >
            <option value="">Select a Subject</option>
            <option value="general">General Inquiry</option>
            <option value="support">Technical Support</option>
            <option value="business">Business Partnership</option>
          </select>
        </div>

        <div className="relative">
          <textarea
            name="message"
            id="message"
            value={formState.message}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-3 border-2 border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-colors duration-200 peer bg-background"
            placeholder=" "
          ></textarea>
          <label
            htmlFor="message"
            className="absolute left-4 top-3 text-muted-foreground transition-all duration-200 -translate-y-7 bg-card px-2 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:bg-transparent peer-focus:-translate-y-7 peer-focus:bg-card"
          >
            Your Message
          </label>
        </div>

        <button
          type="submit"
          className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors duration-200 ${
            formStatus === "success"
              ? "bg-[oklch(0.70_0.15_160)]"
              : formStatus === "error"
              ? "bg-destructive"
              : formStatus === "submitting"
              ? "bg-muted cursor-not-allowed"
              : "bg-primary hover:bg-primary/90"
          }`}
        >
          {formStatus === "success"
            ? "Message Sent!"
            : formStatus === "submitting"
            ? "Sending..."
            : formStatus === "error"
            ? "Error Sending Message"
            : "Send Message"}
        </button>
      </form>
    </motion.div>
  );
};

export default ContactForm;
