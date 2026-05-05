import React, { useState } from "react";
import { updateChildSafetyProfile } from "../api/parentApi";
import { AlertCircle, Utensils, Pill, Phone, ShieldCheck } from "lucide-react";

const ManageSafetyProfile = ({ child, onSave }) => {
  const [allergies, setAllergies] = useState(child?.allergies || []);
  const [allergyInput, setAllergyInput] = useState("");

  const [dietaryRestrictions, setDietaryRestrictions] = useState(
    child?.dietaryRestrictions || [],
  );
  const [dietaryInput, setDietaryInput] = useState("");

  const [medications, setMedications] = useState(child?.medications || []);
  const [medForm, setMedForm] = useState({
    name: "",
    dosage: "",
    timeToAdminister: "",
  });

  const [emergencyContacts, setEmergencyContacts] = useState(
    child?.emergencyContacts || [],
  );
  const [emergencyForm, setEmergencyForm] = useState({
    name: "",
    relationship: "",
    phone: "",
  });

  const [authorizedPickups, setAuthorizedPickups] = useState(
    child?.authorizedPickups || [],
  );
  const [pickupForm, setPickupForm] = useState({
    name: "",
    relationship: "",
    phone: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Allergies handlers
  const addAllergy = () => {
    if (allergyInput.trim()) {
      setAllergies([...allergies, allergyInput.trim()]);
      setAllergyInput("");
    }
  };

  const removeAllergy = (index) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  // Dietary Restrictions handlers
  const addDietaryRestriction = () => {
    if (dietaryInput.trim()) {
      setDietaryRestrictions([...dietaryRestrictions, dietaryInput.trim()]);
      setDietaryInput("");
    }
  };

  const removeDietaryRestriction = (index) => {
    setDietaryRestrictions(dietaryRestrictions.filter((_, i) => i !== index));
  };

  // Medications handlers
  const addMedication = () => {
    if (
      medForm.name.trim() &&
      medForm.dosage.trim() &&
      medForm.timeToAdminister.trim()
    ) {
      setMedications([...medications, { ...medForm }]);
      setMedForm({ name: "", dosage: "", timeToAdminister: "" });
    }
  };

  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  // Emergency Contacts handlers
  const addEmergencyContact = () => {
    if (
      emergencyForm.name.trim() &&
      emergencyForm.relationship.trim() &&
      emergencyForm.phone.trim()
    ) {
      setEmergencyContacts([...emergencyContacts, { ...emergencyForm }]);
      setEmergencyForm({ name: "", relationship: "", phone: "" });
    }
  };

  const removeEmergencyContact = (index) => {
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
  };

  // Authorized Pickups handlers
  const addAuthorizedPickup = () => {
    if (
      pickupForm.name.trim() &&
      pickupForm.relationship.trim() &&
      pickupForm.phone.trim()
    ) {
      setAuthorizedPickups([
        ...authorizedPickups,
        { ...pickupForm, photoIdChecked: false },
      ]);
      setPickupForm({ name: "", relationship: "", phone: "" });
    }
  };

  const removeAuthorizedPickup = (index) => {
    setAuthorizedPickups(authorizedPickups.filter((_, i) => i !== index));
  };

  const togglePhotoIdChecked = (index) => {
    const updated = [...authorizedPickups];
    updated[index].photoIdChecked = !updated[index].photoIdChecked;
    setAuthorizedPickups(updated);
  };

  // Save handler
  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const safetyData = {
        allergies,
        dietaryRestrictions,
        medications,
        emergencyContacts,
        authorizedPickups,
      };

      await updateChildSafetyProfile(child._id, safetyData);

      setMessage("✅ Safety profile updated successfully!");
      if (onSave) onSave(safetyData);

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ Failed to save profile. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#2D3436]">
          Update Child Safety Profile
        </h1>
        <p className="text-gray-600 mt-2">
          Manage health, safety, and emergency contact information for{" "}
          <span className="font-semibold">{child?.name}</span>.
        </p>
      </div>

      <div className="space-y-8">
        {/* ALLERGIES SECTION */}
        <div className="border-b border-gray-100 pb-8">
          <h2 className="text-lg font-bold text-[#2D3436] mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500" />{" "}
              <span className="font-bold">Allergies</span>
            </div>
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="e.g., Peanuts, Shellfish"
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addAllergy()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={addAllergy}
              className="px-5 py-2 bg-red-500 text-white rounded-2xl font-semibold hover:bg-red-600 transition"
            >
              Add
            </button>
          </div>

          {allergies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy, index) => (
                <div
                  key={index}
                  className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-red-200"
                >
                  {allergy}
                  <button
                    onClick={() => removeAllergy(index)}
                    className="text-red-600 hover:text-red-800 font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DIETARY RESTRICTIONS SECTION */}
        <div className="border-b border-gray-100 pb-8">
          <h2 className="text-lg font-bold text-[#2D3436] mb-4">
            <div className="flex items-center gap-2">
              <Utensils size={18} className="text-orange-500" />{" "}
              <span className="font-bold">Dietary Restrictions</span>
            </div>
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="e.g., Gluten-free, Vegan"
              value={dietaryInput}
              onChange={(e) => setDietaryInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addDietaryRestriction()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={addDietaryRestriction}
              className="px-5 py-2 bg-orange-500 text-white rounded-2xl font-semibold hover:bg-orange-600 transition"
            >
              Add
            </button>
          </div>

          {dietaryRestrictions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dietaryRestrictions.map((restriction, index) => (
                <div
                  key={index}
                  className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-orange-200"
                >
                  {restriction}
                  <button
                    onClick={() => removeDietaryRestriction(index)}
                    className="text-orange-600 hover:text-orange-800 font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MEDICATIONS SECTION */}
        <div className="border-b border-gray-100 pb-8">
          <h2 className="text-lg font-bold text-[#2D3436] mb-4">
            <div className="flex items-center gap-2">
              <Pill size={18} className="text-blue-500" />{" "}
              <span className="font-bold">Medications</span>
            </div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input
              type="text"
              placeholder="Medication Name"
              value={medForm.name}
              onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Dosage (e.g., 2 puffs)"
              value={medForm.dosage}
              onChange={(e) =>
                setMedForm({ ...medForm, dosage: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Time to Administer"
              value={medForm.timeToAdminister}
              onChange={(e) =>
                setMedForm({ ...medForm, timeToAdminister: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={addMedication}
            className="w-full px-5 py-2 bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-600 transition"
          >
            Add Medication
          </button>

          {medications.length > 0 && (
            <div className="mt-4 space-y-2">
              {medications.map((med, index) => (
                <div
                  key={index}
                  className="bg-blue-50 border border-blue-200 rounded-2xl p-3 flex items-center justify-between"
                >
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900">{med.name}</p>
                    <p className="text-blue-700 text-xs">
                      {med.dosage} • {med.timeToAdminister}
                    </p>
                  </div>
                  <button
                    onClick={() => removeMedication(index)}
                    className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer text-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* EMERGENCY CONTACTS SECTION */}
        <div className="border-b border-gray-100 pb-8">
          <h2 className="text-lg font-bold text-[#2D3436] mb-4">
            <div className="flex items-center gap-2">
              <Phone size={18} className="text-purple-500" />{" "}
              <span className="font-bold">Emergency Contacts</span>
            </div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input
              type="text"
              placeholder="Name"
              value={emergencyForm.name}
              onChange={(e) =>
                setEmergencyForm({ ...emergencyForm, name: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              placeholder="Relationship"
              value={emergencyForm.relationship}
              onChange={(e) =>
                setEmergencyForm({
                  ...emergencyForm,
                  relationship: e.target.value,
                })
              }
              className="px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={emergencyForm.phone}
              onChange={(e) =>
                setEmergencyForm({ ...emergencyForm, phone: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={addEmergencyContact}
            className="w-full px-5 py-2 bg-purple-500 text-white rounded-2xl font-semibold hover:bg-purple-600 transition"
          >
            Add Emergency Contact
          </button>

          {emergencyContacts.length > 0 && (
            <div className="mt-4 space-y-2">
              {emergencyContacts.map((contact, index) => (
                <div
                  key={index}
                  className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="text-sm">
                    <p className="font-semibold text-purple-900">
                      {contact.name}
                    </p>
                    <p className="text-purple-700 text-xs">
                      {contact.relationship} • {contact.phone}
                    </p>
                  </div>
                  <button
                    onClick={() => removeEmergencyContact(index)}
                    className="text-purple-600 hover:text-purple-800 font-bold cursor-pointer text-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AUTHORIZED PICKUPS SECTION */}
        <div className="border-b border-gray-100 pb-8">
          <h2 className="text-lg font-bold text-[#2D3436] mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-teal-600" />{" "}
              <span className="font-bold">Authorized Pickups</span>
            </div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input
              type="text"
              placeholder="Name"
              value={pickupForm.name}
              onChange={(e) =>
                setPickupForm({ ...pickupForm, name: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="text"
              placeholder="Relationship"
              value={pickupForm.relationship}
              onChange={(e) =>
                setPickupForm({
                  ...pickupForm,
                  relationship: e.target.value,
                })
              }
              className="px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={pickupForm.phone}
              onChange={(e) =>
                setPickupForm({ ...pickupForm, phone: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            onClick={addAuthorizedPickup}
            className="w-full px-5 py-2 bg-teal-500 text-white rounded-2xl font-semibold hover:bg-teal-600 transition"
          >
            Add Authorized Pickup
          </button>

          {authorizedPickups.length > 0 && (
            <div className="mt-4 space-y-3">
              {authorizedPickups.map((pickup, index) => (
                <div
                  key={index}
                  className="bg-teal-50 border border-teal-200 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm flex-1">
                      <p className="font-semibold text-teal-900">
                        {pickup.name}
                      </p>
                      <p className="text-teal-700 text-xs">
                        {pickup.relationship} • {pickup.phone}
                      </p>
                    </div>
                    <button
                      onClick={() => removeAuthorizedPickup(index)}
                      className="text-teal-600 hover:text-teal-800 font-bold cursor-pointer text-lg"
                    >
                      ✕
                    </button>
                  </div>
                  <button
                    onClick={() => togglePhotoIdChecked(index)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full transition ${
                      pickup.photoIdChecked
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {pickup.photoIdChecked
                      ? "✓ ID Verified"
                      : "ID Not Verified"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="text-center p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="text-sm font-semibold text-slate-700">{message}</p>
          </div>
        )}

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#4D9699] text-white rounded-full py-3 font-semibold text-lg hover:bg-opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {saving ? "Saving..." : "Save Profile Updates"}
        </button>
      </div>
    </div>
  );
};

export default ManageSafetyProfile;
