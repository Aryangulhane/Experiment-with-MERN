// src/app/contact/page.tsx
"use client";

import { useState, ChangeEvent, FormEvent, FC, ReactNode, useRef, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import {
  FaEnvelope,
  FaGithub,
  FaLinkedin,
  FaCopy,
  FaCheck,
  FaInstagram,
  FaTwitter,
  FaSpotify,
} from "react-icons/fa";
import { FiLoader, FiCheckCircle, FiAlertTriangle, FiSend } from "react-icons/fi";

// --- Main Page Component ---
export default function ContactPage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background px-4 py-24 sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(40%_100%_at_50%_0%,rgba(var(--primary-rgb),0.1)_0%,rgba(var(--primary-rgb),0)_100%)]"
      />
      <div className="container mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mx-auto grid max-w-7xl grid-cols-1 gap-16 lg:grid-cols-2"
        >
          <ContactInfo />
          <ContactForm />
        </motion.div>
      </div>
    </div>
  );
}

// --- Helper Components ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const ContactInfo: FC = () => (
  <motion.div
    variants={containerVariants}
    className="flex flex-col justify-center"
  >
    <motion.div
      variants={itemVariants}
      className="cyber-text text-5xl font-bold lg:text-6xl"
    >
      <TypeAnimation
        sequence={[
          "Let's Build Something.",
          2000,
          "Solving Problems with Next.js.",
          2000,
          "Crafting Digital Experiences.",
          2000,
          "Have an Idea? Let's Talk.",
          3000,
        ]}
        wrapper="span"
        speed={50}
        className="gradient-text"
        repeat={Infinity}
        cursor={true}
      />
    </motion.div>
    <motion.p variants={itemVariants} className="mt-6 text-lg text-muted-foreground">
      As of October 2025, I am available for freelance work and open to discussing new projects. Let's create something amazing together.
    </motion.p>
    <motion.div variants={itemVariants} className="mt-12 space-y-4">
      <EmailContactDetail
        icon={<FaEnvelope />}
        email="aryangulhane6@gmail.com"
      />
      <ContactDetail
        icon={<FaLinkedin />}
        text="Connect on LinkedIn"
        href="https://www.linkedin.com/in/aryan-gulhane"
      />
      <ContactDetail
        icon={<FaGithub />}
        text="Explore my Projects"
        href="https://github.com/Aryangulhane"
      />
      <ContactDetail
        icon={<FaInstagram />}
        text="Explore my Life"
        href="https://instagram.com/aryangulhane21"
      />
      <ContactDetail
        icon={<FaTwitter />}
        text="Explore my Thoughts"
        href="https://x.com/AryanGulhane3"
      />
      <ContactDetail
        icon={<FaSpotify />}
        text="Know my Music Taste"
        href="https://open.spotify.com/user/31lmnozvyi6m4ynu7sdbgbfnkmyq"
      />
    </motion.div>
  </motion.div>
);

const EmailContactDetail = ({ icon, email }: { icon: ReactNode; email: string }) => {
  const [isCopied, setIsCopied] = useState(false);
  const handleCopy = async () => {
    try {
      
      await navigator.clipboard.writeText(email);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };
  return (
    <div className="group flex items-center justify-between rounded-lg border border-border bg-secondary p-4 transition-all hover:border-primary/50">
      <div className="flex items-center gap-4">
        <span className="text-xl text-muted-foreground transition-colors group-hover:text-primary">{icon}</span>
        <span className="font-mono text-muted-foreground">{email}</span>
      </div>
      <motion.button
        onClick={handleCopy}
        className="text-muted-foreground transition-colors hover:text-primary"
        aria-label="Copy email"
        whileTap={{ scale: 0.9 }}
      >
        {isCopied ? <FaCheck className="text-green-500" /> : <FaCopy />}
      </motion.button>
    </div>
  );
};

const ContactDetail = ({ icon, text, href }: { icon: ReactNode; text: string; href: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex items-center gap-4 rounded-lg p-4 text-muted-foreground transition-all hover:bg-secondary hover:text-primary"
  >
    <span className="text-xl">{icon}</span>
    <span>{text}</span>
  </a>
);

// ## FIXED Contact Form Section (Right Side) ##
const ContactForm: FC = () => {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cardRef.current?.style.setProperty("--mouse-x", `${x}px`);
      cardRef.current?.style.setProperty("--mouse-y", `${y}px`);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormState({ ...formState, [e.target.name]: e.target.value });

  // --- THIS IS THE FIX ---
  // The complete form submission logic has been restored.
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setFeedbackMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "An unknown error occurred.");
      }

      setStatus("success");
      setFeedbackMessage("Message received! I'll be in touch shortly.");
      setFormState({ name: "", email: "", message: "" });
      // Optional: Reset the form back to idle after a few seconds
      // setTimeout(() => setStatus("idle"), 5000);

    } catch (error) {
      setStatus("error");
      setFeedbackMessage(error instanceof Error ? error.message : "Failed to send message.");
    }
  };
  // --- END OF FIX ---

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      variants={itemVariants}
      className="contact-card group relative rounded-2xl border border-border bg-secondary/50 p-8 shadow-2xl"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(var(--primary-rgb), 0.15), transparent 80%)`,
        }}
      />
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <FormFeedback status="success" message={feedbackMessage} />
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <h3 className="mb-8 text-center text-2xl font-semibold text-foreground">Send a Message</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField id="name" label="Your Name" type="text" value={formState.name} onChange={handleChange} required />
                <FormField id="email" label="Your Email" type="email" value={formState.email} onChange={handleChange} required />
              </div>
              <FormField id="message" label="Your Message" type="textarea" value={formState.message} onChange={handleChange} required />
              <AnimatePresence>
                {status === "error" && <FormFeedback key="error" status="error" message={feedbackMessage} />}
              </AnimatePresence>
              <motion.button
                type="submit"
                disabled={status === "submitting"}
                className="animated-border btn flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-lg font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {status === "submitting" ? (
                  <><FiLoader className="animate-spin" /> Transmitting...</>
                ) : (
                  <><FiSend /> Send Message</>
                )}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface FormFieldProps {
  id: string;
  label: string;
  type: "text" | "email" | "textarea";
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
}

const FormField: FC<FormFieldProps> = ({ id, label, type, ...props }) => {
  const InputComponent = type === "textarea" ? "textarea" : "input";
  return (
    <div className="relative">
      <InputComponent
        id={id}
        name={id}
        type={type}
        placeholder=" "
        rows={type === "textarea" ? 5 : undefined}
        className="peer block w-full resize-none rounded-lg border border-border bg-secondary px-4 py-3 text-foreground transition-colors placeholder:text-transparent focus:border-primary focus:outline-none focus:ring-0"
        {...props}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-3 origin-[0] -translate-y-6 scale-75 transform text-sm text-muted-foreground duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-primary"
      >
        {label}
      </label>
    </div>
  );
};

const FormFeedback = ({ status, message }: { status: "success" | "error"; message: string }) => {
  const isSuccess = status === 'success';
  const Icon = isSuccess ? FiCheckCircle : FiAlertTriangle;
  return (
    <motion.div
      initial={{ opacity: 0, y: isSuccess ? 0 : -10, scale: isSuccess ? 0.95 : 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10 }}
      className={`flex items-center gap-3 rounded-lg p-3 text-sm ${
        isSuccess
          ? 'flex-col justify-center py-8 text-center text-lg'
          : 'border border-destructive/20 bg-destructive/10 text-destructive'
      }`}
    >
      <Icon className={isSuccess ? 'mb-4 text-5xl text-green-500' : ''} />
      <div className={isSuccess ? 'flex flex-col' : ''}>
        {isSuccess && <h3 className="text-2xl font-bold text-foreground">Transmission Complete!</h3>}
        <p className={isSuccess ? 'mt-2 text-muted-foreground' : ''}>{message}</p>
      </div>
    </motion.div>
  );
};