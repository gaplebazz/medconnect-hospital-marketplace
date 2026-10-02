require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Clinic = require('../models/Clinic');
const Doctor = require('../models/Doctor');
const Speciality = require('../models/Speciality');

// Marks seeded documents so they can be safely removed later without
// touching real user registrations (`npm run seed:destroy`).
const SEED_TAG = 'SEED_DATA';

// Image sources used for demo data (all free-to-use, no API key required):
// - ui-avatars.com generates a clean initials logo/badge for hospitals/clinics
// - images.pexels.com serves real, Pexels-licensed medical photography (free for any use,
//   no attribution required) - curated photo IDs below, grouped by subject so each listing
//   gets topically relevant real photos instead of generic placeholders
// - randomuser.me/api/portraits serves realistic human portrait photos for doctor profiles
const logoUrl = (name, bg) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&size=256&bold=true`;
const pexelsUrl = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900&h=560&fit=crop`;
const doctorPhotoUrl = (gender, n) => `https://randomuser.me/api/portraits/${gender === 'female' ? 'women' : 'men'}/${n}.jpg`;

// Curated real photo pools (hospital wards/patient-care, dental clinic, eye clinic)
const HOSPITAL_PHOTOS = [6129681, 6129207, 6129195, 6129237, 6129655, 6129158, 6129052, 6129149, 6129144];
const DENTAL_PHOTOS = [8669945, 8669944, 3845807, 3845810, 3779706, 3779708];
const EYE_PHOTOS = [5765829, 6749763, 5996606, 5996653, 5996611, 5996599];
const GENERAL_CLINIC_PHOTOS = [6129040, 6129676, 6129150, 6129204];

const specialities = [
  { name: 'Cardiology', icon: '❤️', image: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=500&h=400&fit=crop' },
  { name: 'Orthopedics', icon: '🦴', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&h=400&fit=crop' },
  { name: 'Pediatrics', icon: '🧸', image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=500&h=400&fit=crop' },
  { name: 'Dermatology', icon: '🩹', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=400&fit=crop' },
  { name: 'Neurology', icon: '🧠', image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=400&fit=crop' },
  { name: 'Dentistry', icon: '🦷', image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&h=400&fit=crop' },
  { name: 'Gynecology', icon: '👶', image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=500&h=400&fit=crop' },
  { name: 'General Medicine', icon: '🩺', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&h=400&fit=crop' },
  { name: 'ENT', icon: '👂', image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=500&h=400&fit=crop' },
  { name: 'Ophthalmology', icon: '👁️', image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&h=400&fit=crop' },
];

const hospitalsData = [
  {
    name: 'Sunrise Multi-Speciality Hospital', city: 'Jaipur', state: 'Rajasthan',
    specialities: ['Cardiology', 'Orthopedics', 'Neurology'], emergencyService: true, available247: true,
  },
  {
    name: 'City Care General Hospital', city: 'Delhi', state: 'Delhi',
    specialities: ['General Medicine', 'Pediatrics', 'ENT'], emergencyService: true, available247: true,
  },
  {
    name: 'Green Valley Hospital', city: 'Bhiwadi', state: 'Rajasthan',
    specialities: ['Dermatology', 'Gynecology'], emergencyService: false, available247: false,
  },
];

const clinicsData = [
  {
    name: 'Smile Dental Clinic', city: 'Jaipur', state: 'Rajasthan',
    specialities: ['Dentistry'], consultationFee: 500, photoPool: 'DENTAL_PHOTOS',
  },
  {
    name: 'Family Health Clinic', city: 'Bhiwadi', state: 'Rajasthan',
    specialities: ['General Medicine', 'Pediatrics'], consultationFee: 300, photoPool: 'GENERAL_CLINIC_PHOTOS',
  },
  {
    name: 'Vision Eye Clinic', city: 'Delhi', state: 'Delhi',
    specialities: ['Ophthalmology'], consultationFee: 700, photoPool: 'EYE_PHOTOS',
  },
];

// `affiliatedHospitalIndex` / `affiliatedClinicIndex` link a doctor to an entry
// above (by array position) so the Hospital/Clinic detail page's "Doctors" tab
// is populated with real, working links out of the box.
const doctorsData = [
  {
    name: 'Dr. Ananya Sharma', specialization: 'Cardiology', experience: 12, gender: 'female',
    consultationFee: 900, city: 'Jaipur', state: 'Rajasthan', qualification: 'MBBS, MD (Cardiology)',
    affiliatedHospitalIndex: 0, photo: 44,
  },
  {
    name: 'Dr. Rohan Verma', specialization: 'Orthopedics', experience: 8, gender: 'male',
    consultationFee: 700, city: 'Jaipur', state: 'Rajasthan', qualification: 'MBBS, MS (Ortho)',
    affiliatedHospitalIndex: 0, photo: 32,
  },
  {
    name: 'Dr. Kavita Singh', specialization: 'Pediatrics', experience: 15, gender: 'female',
    consultationFee: 600, city: 'Bhiwadi', state: 'Rajasthan', qualification: 'MBBS, MD (Pediatrics)',
    affiliatedClinicIndex: 1, photo: 65,
  },
  {
    name: 'Dr. Arjun Mehta', specialization: 'Dermatology', experience: 6, gender: 'male',
    consultationFee: 500, city: 'Bhiwadi', state: 'Rajasthan', qualification: 'MBBS, MD (Dermatology)',
    affiliatedHospitalIndex: 2, photo: 51,
  },
];

async function seed() {
  await connectDB();

  if (process.argv.includes('--destroy')) {
    await User.deleteMany({ email: { $regex: `^seed_` } });
    await Hospital.deleteMany({ licenseNumber: { $regex: `^${SEED_TAG}` } });
    await Clinic.deleteMany({ registrationNumber: { $regex: `^${SEED_TAG}` } });
    await Doctor.deleteMany({ registrationNumber: { $regex: `^${SEED_TAG}` } });
    console.log('🗑️  Seed data removed.');
    return mongoose.connection.close();
  }

  await Speciality.deleteMany({});
  await Speciality.insertMany(specialities);
  console.log(`✅ Inserted ${specialities.length} specialities.`);

  const createdHospitals = [];
  const createdClinics = [];

  let count = 1;
  for (const h of hospitalsData) {
    const user = await User.create({
      name: h.name,
      email: `seed_hospital${count}@medconnect.test`,
      phone: `90000000${count.toString().padStart(2, '0')}`,
      password: 'Password123',
      role: 'hospital',
      status: 'approved',
    });
    const hospital = await Hospital.create({
      owner: user._id,
      name: h.name,
      adminName: `${h.name} Admin`,
      email: user.email,
      phone: user.phone,
      licenseNumber: `${SEED_TAG}-HOSP-${count}`,
      address: `${count} Main Road`,
      city: h.city,
      state: h.state,
      pincode: '110001',
      description: `${h.name} is a trusted healthcare provider offering quality care across multiple departments, with a patient-first approach and modern medical infrastructure.`,
      emergencyService: h.emergencyService,
      available247: h.available247,
      departments: h.specialities,
      specialities: h.specialities,
      facilities: ['ICU', 'Pharmacy', 'Ambulance', 'Parking'],
      website: '',
      logo: logoUrl(h.name, '0f6e63'),
      images: HOSPITAL_PHOTOS.slice((count - 1) * 3, (count - 1) * 3 + 3).map(pexelsUrl),
      verificationStatus: 'approved',
      rating: Math.round((4 + Math.random() * 0.9) * 10) / 10,
      numReviews: Math.floor(Math.random() * 50) + 5,
    });
    user.profileRef = hospital._id;
    user.profileModel = 'Hospital';
    await user.save();
    createdHospitals.push(hospital);
    count++;
  }

  count = 1;
  for (const c of clinicsData) {
    const user = await User.create({
      name: c.name,
      email: `seed_clinic${count}@medconnect.test`,
      phone: `91000000${count.toString().padStart(2, '0')}`,
      password: 'Password123',
      role: 'clinic',
      status: 'approved',
    });
    const clinic = await Clinic.create({
      owner: user._id,
      name: c.name,
      ownerName: `Dr. Owner ${count}`,
      email: user.email,
      phone: user.phone,
      registrationNumber: `${SEED_TAG}-CLIN-${count}`,
      address: `${count} Market Street`,
      city: c.city,
      state: c.state,
      pincode: '110001',
      description: `${c.name} provides friendly, professional outpatient care with modern equipment and a comfortable patient experience.`,
      specialities: c.specialities,
      facilities: ['Waiting Lounge', 'Pharmacy'],
      openingHours: '9:00 AM - 8:00 PM',
      website: '',
      logo: logoUrl(c.name, '17a892'),
      images: { DENTAL_PHOTOS, GENERAL_CLINIC_PHOTOS, EYE_PHOTOS }[c.photoPool].slice(0, 3).map(pexelsUrl),
      consultationFee: c.consultationFee,
      verificationStatus: 'approved',
      rating: Math.round((4 + Math.random() * 0.9) * 10) / 10,
      numReviews: Math.floor(Math.random() * 30) + 5,
    });
    user.profileRef = clinic._id;
    user.profileModel = 'Clinic';
    await user.save();
    createdClinics.push(clinic);
    count++;
  }

  count = 1;
  for (const d of doctorsData) {
    const user = await User.create({
      name: d.name,
      email: `seed_doctor${count}@medconnect.test`,
      phone: `92000000${count.toString().padStart(2, '0')}`,
      password: 'Password123',
      role: 'doctor',
      status: 'approved',
    });
    const affiliatedHospital = d.affiliatedHospitalIndex !== undefined ? createdHospitals[d.affiliatedHospitalIndex] : null;
    const affiliatedClinic = d.affiliatedClinicIndex !== undefined ? createdClinics[d.affiliatedClinicIndex] : null;
    const doctor = await Doctor.create({
      owner: user._id,
      name: d.name,
      email: user.email,
      phone: user.phone,
      registrationNumber: `${SEED_TAG}-DOC-${count}`,
      qualification: d.qualification,
      specialization: d.specialization,
      experience: d.experience,
      gender: d.gender,
      consultationFee: d.consultationFee,
      languages: ['English', 'Hindi'],
      affiliation: affiliatedHospital?.name || affiliatedClinic?.name || '',
      affiliatedHospital: affiliatedHospital?._id,
      affiliatedClinic: affiliatedClinic?._id,
      city: d.city,
      state: d.state,
      about: `${d.name} is an experienced ${d.specialization} specialist dedicated to patient-centered, evidence-based care.`,
      profilePhoto: doctorPhotoUrl(d.gender, d.photo),
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      availableTime: '10:00 AM - 4:00 PM',
      verificationStatus: 'approved',
      rating: Math.round((4 + Math.random() * 0.9) * 10) / 10,
      numReviews: Math.floor(Math.random() * 40) + 5,
    });
    user.profileRef = doctor._id;
    user.profileModel = 'Doctor';
    await user.save();
    count++;
  }

  // A ready-to-use admin account
  const adminExists = await User.findOne({ email: 'admin@medconnect.test' });
  if (!adminExists) {
    await User.create({
      name: 'Platform Admin',
      email: 'admin@medconnect.test',
      phone: '9999999999',
      password: 'Admin@123',
      role: 'admin',
      status: 'approved',
    });
    console.log('👤 Admin account created: admin@medconnect.test / Admin@123');
  }

  console.log('✅ Seed data inserted: 3 hospitals, 3 clinics, 4 doctors — all with photos and linked affiliations.');
  console.log('   All seeded provider accounts use password: Password123');
  mongoose.connection.close();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
