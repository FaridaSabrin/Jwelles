import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ImagePlus, Send, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { submitCustomization } from "../services/api";
import "./CustomJewelry.css";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // matches the backend's limit — checked here too so the shopper isn't kept waiting for a round trip just to find out

const CUSTOM_TYPES = {
  design: {
    title: "Design Your Own Jewelry",
    description: "Create unique jewelry pieces tailored to your style",
    steps: ["Choose your metal", "Select gemstones", "Pick a design", "We craft it for you"],
  },
  engraving: {
    title: "Engraving Services",
    description: "Add personal messages to your favorite pieces",
    steps: ["Select jewelry", "Choose font style", "Add your message", "We engrave it"],
  },
  birthstone: {
    title: "Birthstone Jewelry",
    description: "Celebrate birthdays with beautiful birthstone pieces",
    steps: ["Select month", "Choose jewelry type", "Pick birthstone", "We create it"],
  },
  name: {
    title: "Name Necklaces",
    description: "Wear your name or loved one's name with pride",
    steps: ["Enter name", "Choose style", "Select metal", "We craft it"],
  },
  photo: {
    title: "Photo Jewelry",
    description: "Turn your precious memories into wearable art",
    steps: ["Upload photo", "Choose jewelry", "Select size", "We create it"],
  },
};

const emptyForm = (user) => ({ name: user?.name || "", phone: "", email: user?.email || "", description: "" });

export default function CustomJewelry() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "design";
  const currentType = CUSTOM_TYPES[type] || CUSTOM_TYPES.design;

  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const formSectionRef = useRef(null);

  const [form, setForm] = useState(() => emptyForm(user));
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill from the logged-in account once it loads, without clobbering
  // anything the shopper has already typed.
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({ ...f, name: f.name || user.name || "", email: f.email || user.email || "" }));
  }, [user]);

  // The preview is an object URL — release it on swap/unmount so it doesn't leak.
  useEffect(() => () => { if (imagePreview) URL.revokeObjectURL(imagePreview); }, [imagePreview]);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later (e.g. after Remove)
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Please upload a valid image file (JPEG, PNG, or WebP).");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageError("Image must be smaller than 5 MB.");
      return;
    }

    setImageError("");
    setImageFile(file);
    setImagePreview((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file); });
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setImageError("");
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Required";
    if (!form.phone.trim()) next.phone = "Required";
    if (!form.description.trim()) next.description = "Please tell us what you'd like us to create.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("customization_type", type);
      formData.append("name", form.name.trim());
      formData.append("phone", form.phone.trim());
      if (form.email.trim()) formData.append("email", form.email.trim());
      formData.append("description", form.description.trim());
      if (imageFile) formData.append("reference_image", imageFile);

      await submitCustomization(formData);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const startNewRequest = () => {
    setSubmitted(false);
    setForm(emptyForm(user));
    setErrors({});
    removeImage();
  };

  return (
    <div className="custom-jewelry-page">
      <div className="container">
        <h1>{currentType.title}</h1>
        <p>{currentType.description}</p>

        <div className="custom-steps">
          {currentType.steps.map((step, index) => (
            <div className="custom-step" key={index}>
              <span className="step-number">{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={() => formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        >
          Get Started
        </button>

        <div className="custom-form-section" ref={formSectionRef}>
          <h2 className="heading-md">Submit Your Customization Request</h2>

          {!isAuthenticated ? (
            <div className="custom-form-locked">
              <p>Please log in to submit a customization request.</p>
              <Link to="/login" className="btn btn-outline">Log In</Link>
            </div>
          ) : submitted ? (
            <div className="custom-form-success">
              <p>🎉 Thank you! Your request has been submitted — our team will reach out to you shortly.</p>
              <button type="button" className="btn btn-outline" onClick={startNewRequest}>Submit Another Request</button>
            </div>
          ) : (
            <form className="custom-form" onSubmit={handleSubmit} noValidate>
              <div className="custom-form-grid">
                <div className="field">
                  <label>Name</label>
                  <input className={`input ${errors.name ? "has-error" : ""}`} value={form.name} onChange={setField("name")} placeholder="Your name" />
                  {errors.name && <p className="field-error">{errors.name}</p>}
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input className={`input ${errors.phone ? "has-error" : ""}`} value={form.phone} onChange={setField("phone")} placeholder="Phone number" type="tel" />
                  {errors.phone && <p className="field-error">{errors.phone}</p>}
                </div>
                <div className="field custom-grid-full">
                  <label>Email (optional)</label>
                  <input className="input" value={form.email} onChange={setField("email")} placeholder="Email address" type="email" />
                </div>
                <div className="field custom-grid-full">
                  <label>Customization Details</label>
                  <textarea
                    className={`textarea ${errors.description ? "has-error" : ""}`}
                    value={form.description}
                    onChange={setField("description")}
                    placeholder="Tell us what you'd like — metal, gemstones, size, engraving text, or any other details."
                    rows={5}
                  />
                  {errors.description && <p className="field-error">{errors.description}</p>}
                </div>
                <div className="field custom-grid-full">
                  <label>Reference Image (optional)</label>
                  {!imagePreview ? (
                    <label className="custom-upload-area">
                      <ImagePlus size={28} />
                      <span>Choose Image</span>
                      <span className="custom-upload-hint">No image selected · JPEG, PNG or WebP, up to 5 MB</span>
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} hidden />
                    </label>
                  ) : (
                    <div className="custom-image-preview">
                      <img src={imagePreview} alt="Selected reference" />
                      <div className="custom-image-preview-meta">
                        <span>{imageFile.name}</span>
                        <button type="button" className="btn-ghost" onClick={removeImage}><X size={14} /> Remove</button>
                      </div>
                    </div>
                  )}
                  {imageError && <p className="field-error">{imageError}</p>}
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                {submitting && <span className="btn-spinner" />} <Send size={16} /> {submitting ? "Submitting…" : "Submit Customization"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

