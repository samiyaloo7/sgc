'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  ShirtIcon,
} from 'lucide-react'
import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { collection, addDoc } from "firebase/firestore"; 
import Image from 'next/image'

import { z } from 'zod'; // Import Zod

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXcaZE6awq33OkMEohwYdtmUvsx13J6f0",
  authDomain: "sgc25-d45b4.firebaseapp.com",
  projectId: "sgc25-d45b4",
  storageBucket: "sgc25-d45b4.firebasestorage.app",
  messagingSenderId: "893577028375",
  appId: "1:893577028375:web:e87446d605abd006c2cd52",
  measurementId: "G-HRBTNQCSKX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Zod validation schema
const formSchema = z.object({
  fullName: z.string().min(1, 'Full Name is required').min(3, 'Full Name should be at least 3 characters long'),
  phone: z.string().min(1, 'Phone Number is required').regex(/^\d+$/, 'Phone Number should contain only numbers').min(10, 'Phone Number should be at least 10 digits'),
  whatsapp: z.string().min(1, 'WhatsApp Number is required').regex(/^\d+$/, 'WhatsApp Number should contain only numbers').min(10, 'WhatsApp Number should be at least 10 digits'),
  ageGroup: z.string().min(1, 'Age Group is required'),
});

type inputEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>

export default function RegistrationPage() {
  const [step, setStep] = useState<null | number>(null) //reg, success
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    whatsapp: '',
    ageGroup: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({}); // To store validation errors

  const handleChange = (e: inputEvent) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, ageGroup: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate the form using Zod
    const validation = formSchema.safeParse(formData);
    
    if (!validation.success) {
      // If validation fails, set errors
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    try {
      // Step 1: Get the current counter value from the 'counters' collection
      const counterDocRef = doc(db, "counters", "userIdCounter");
      const counterDocSnap = await getDoc(counterDocRef);

      let newId: number;
      if (counterDocSnap.exists()) {
        // If counter exists, increment it
        newId = counterDocSnap.data().counter + 1;
      } else {
        // If no counter document exists, start from 1
        newId = 1;
      }

      // Step 2: Update the counter with the new value
      await setDoc(counterDocRef, { counter: newId }, { merge: true });

      // Step 3: Use the newId as the document ID for Firestore
      const docRef = await addDoc(collection(db, "users"), formData);

      // Use the newId as the document's custom ID
      await setDoc(docRef, {
        ...formData,
        id: newId
      });

      setFormData({
        fullName: '',
        phone: '',
        whatsapp: '',
        ageGroup: '',
      })

      setStep(newId)
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-white to-blue-100 p-4">
      <Card className="w-full max-w-2xl shadow-lg border border-gray-200">
        <CardHeader className="text-center flex flex-col md:flex-row items-center gap-2">
          <Image src="/sgc_black.PNG" objectFit="contain" height={120} width={120} alt="sgc" />
          <div>
            <CardTitle className="text-2xl font-bold text-blue-700">
              REGISTRATION FOR 7 DAYS MEGA WORKSHOP
            </CardTitle>
            <p className="text-sm text-gray-500">
              (20TH JULY TO 26TH JULY 2K25)
            </p>
          </div>
        </CardHeader>
        <Separator />

        {!step ? (
          <CardContent className="space-y-6 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
                {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="Enter your WhatsApp number"
                  required
                />
                {errors.whatsapp && <p className="text-red-500 text-sm">{errors.whatsapp}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ageGroup">Age Group</Label>
                <Select onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Age Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KIDS">KIDS</SelectItem>
                    <SelectItem value="MALE">MALE</SelectItem>
                    <SelectItem value="FEMALE">FEMALE</SelectItem>
                  </SelectContent>
                </Select>
                {errors.ageGroup && <p className="text-red-500 text-sm">{errors.ageGroup}</p>}
              </div>

              <Button type="submit" className="w-full mt-4">
                Register
              </Button>
            </form>
          </CardContent>            
        ) : (
          <CardContent className="p-0">
            <div className="w-full h-[50vh] relative">
              <Image src="/background.jpg" objectFit="contain" fill alt="sgc-group" />
            </div>
            <div className="space-y-6 mt-4 p-4">
              <p className="text-2xl font-bold text-green-700">Registration Successful</p>
              <p className="text-xl font-bold text-gray-700">
                Registration ID: <span className="text-blue-700">{step}</span>
              </p>
              <Button onClick={() => setStep(null)}>Register Again</Button>
            </div>
            <Separator />

            <div className="text-sm text-gray-700 space-y-3 p-4">
              <p className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-blue-500" />
                <span><strong>Time:</strong> Sunday 6 to 8, Monday to Saturday: 8 to 10</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-pink-500" />
                <span><strong>Venue:</strong> ATAL HALL, NEAR MOTIBAG ROAD BHAVNAGAR</span>
              </p>
              <p className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-green-600" />
                <span><strong>Contact:</strong> 8758151546</span>
              </p>
              <p className="flex items-center gap-2">
                <ShirtIcon className="w-4 h-4 text-yellow-600" />
                <span><strong>Dress Code:</strong> The white ocean</span>
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
