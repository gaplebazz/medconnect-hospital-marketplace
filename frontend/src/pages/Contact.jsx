import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import FormInput from '../components/FormInput';

export default function Contact() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('Thanks for reaching out! We will get back to you soon.', 'success');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="container section" style={{ maxWidth: 560 }}>
      <div className="section-head"><div><h2>Contact Us</h2><p>Have a question or need help? Send us a message.</p></div></div>
      <div className="card" style={{ padding: 28 }}>
        <form onSubmit={handleSubmit}>
          <FormInput label="Your Name" name="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <FormInput label="Email Address" type="email" name="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
          <FormInput label="Message" name="message" textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} required />
          <button className="btn btn-primary btn-block">Send Message</button>
        </form>
      </div>
    </div>
  );
}
