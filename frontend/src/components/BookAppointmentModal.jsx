import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from './Modal';
import FormInput from './FormInput';
import Loader from './Loader';

export default function BookAppointmentModal({ open, onClose, targetType, targetId, targetName }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ patientName: user?.name || '', patientPhone: user?.phone || '', preferredDate: '', preferredTime: '', reason: '' });
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please log in as a patient to book an appointment.', 'error');
      navigate('/login');
      return;
    }
    if (user.role !== 'patient') {
      showToast('Only patient accounts can request appointments.', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.post('/appointments', { targetType, targetId, ...form });
      showToast('Appointment requested! You will be notified once confirmed.', 'success');
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Book with ${targetName}`}>
      <form onSubmit={handleSubmit}>
        <FormInput label="Your Name" name="patientName" value={form.patientName} onChange={update('patientName')} required />
        <FormInput label="Phone Number" name="patientPhone" value={form.patientPhone} onChange={update('patientPhone')} required />
        <div className="field-row">
          <FormInput label="Preferred Date" type="date" name="preferredDate" value={form.preferredDate} onChange={update('preferredDate')} required />
          <FormInput label="Preferred Time" name="preferredTime" value={form.preferredTime} onChange={update('preferredTime')} placeholder="10:00 AM" required />
        </div>
        <FormInput label="Reason for Visit (optional)" name="reason" textarea value={form.reason} onChange={update('reason')} />
        <button className="btn btn-primary btn-block" disabled={loading}>{loading ? <Loader inline /> : 'Request Appointment'}</button>
      </form>
    </Modal>
  );
}
