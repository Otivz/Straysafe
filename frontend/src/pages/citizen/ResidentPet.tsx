import { useState, useEffect } from 'react';
import Button from '../../components/Button';
import ResiNavbar from '../../components/Navbars/ResiNavbar';
import ResiMobileNav from '../../components/Navbars/ResiMobileNav';

const ResidentPet = () => {
    const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
    const [isNavbarMenuOpen, setIsNavbarMenuOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pets, setPets] = useState<any[]>([]);
    const [editingPetId, setEditingPetId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        species: 'Dog',
        breed: '',
        gender: 'Male',
        color: '',
        age: '',
        status: 'Healthy',
        condition: '',
        mediaFiles: [] as File[]
    });

    // Mock pets data for initial UI check
    useEffect(() => {
        // In a real app, you'd fetch this from the backend
        const mockPets = [
            {
                id: 1,
                name: 'Bruno',
                species: 'Dog',
                breed: 'Golden Retriever',
                gender: 'Male',
                color: 'Golden',
                age: '3 years',
                status: 'Healthy',
                condition: 'Up to date with vaccinations',
                image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            },
            {
                id: 2,
                name: 'Luna',
                species: 'Cat',
                breed: 'Persian',
                gender: 'Female',
                color: 'White',
                age: '1 year',
                status: 'Under Treatment',
                condition: 'Recovering from minor skin allergy',
                image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            }
        ];
        setPets(mockPets);
    }, []);

    const handleEditClick = (pet: any) => {
        setFormData({
            name: pet.name,
            species: pet.species,
            breed: pet.breed,
            gender: pet.gender,
            color: pet.color,
            age: pet.age,
            status: pet.status,
            condition: pet.condition,
            mediaFiles: []
        });
        setEditingPetId(pet.id);
        setIsAddPetModalOpen(true);
    };

    const handleDeletePet = (id: number) => {
        if (window.confirm('Are you sure you want to remove this pet?')) {
            setPets(pets.filter(p => p.id !== id));
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            if (editingPetId) {
                setPets(pets.map(p => p.id === editingPetId ? { ...formData, id: editingPetId, image: p.image } : p));
            } else {
                const newPet = {
                    ...formData,
                    id: Date.now(),
                    image: formData.species === 'Dog' 
                        ? 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                        : 'https://images.unsplash.com/photo-1533733352364-90375b911b80?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                };
                setPets([newPet, ...pets]);
            }
            setIsSubmitting(false);
            setIsAddPetModalOpen(false);
            setEditingPetId(null);
            setFormData({
                name: '',
                species: 'Dog',
                breed: '',
                gender: 'Male',
                color: '',
                age: '',
                status: 'Healthy',
                condition: '',
                mediaFiles: []
            });
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#FAFAF9] font-sans pb-20">
            <ResiNavbar onMenuToggle={(isOpen) => setIsNavbarMenuOpen(isOpen)} />

            <main className="max-w-6xl mx-auto p-4 sm:p-8 pt-24 sm:pt-32">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-[#1a1208] uppercase tracking-tighter">My Family <span className="text-[#F97316]">Pets</span></h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Manage your pets' health and identification records</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setEditingPetId(null);
                            setFormData({
                                name: '',
                                species: 'Dog',
                                breed: '',
                                gender: 'Male',
                                color: '',
                                age: '',
                                status: 'Healthy',
                                condition: '',
                                mediaFiles: []
                            });
                            setIsAddPetModalOpen(true);
                        }}
                        className="bg-[#F97316] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-200 hover:scale-105 transition-all flex items-center gap-3"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                        </svg>
                        Register New Pet
                    </Button>
                </div>

                {/* Pets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pets.length === 0 ? (
                        <div className="col-span-full py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-[#F97316] mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-black text-[#1a1208] uppercase">No Pets Registered Yet</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Add your pets to help the community keep them safe</p>
                        </div>
                    ) : (
                        pets.map((pet) => (
                            <div key={pet.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                                <div className="relative h-56 overflow-hidden">
                                    <img src={pet.image} alt={pet.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border ${
                                            pet.status === 'Healthy' ? 'bg-green-50 text-green-600 border-green-100' :
                                            pet.status === 'Under Treatment' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            'bg-red-50 text-red-600 border-red-100'
                                        }`}>
                                            {pet.status}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    <div className="absolute bottom-4 left-6">
                                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">{pet.name}</h2>
                                        <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">{pet.breed || pet.species}</p>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded-2xl p-3">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Gender / Age</p>
                                            <p className="text-xs font-black text-[#1a1208] uppercase">{pet.gender} • {pet.age}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-2xl p-3">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Color</p>
                                            <p className="text-xs font-black text-[#1a1208] uppercase">{pet.color || 'Not specified'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Condition Details</p>
                                        <p className="text-xs font-medium text-[#4a3b28] leading-relaxed">
                                            {pet.condition || 'No specific conditions noted.'}
                                        </p>
                                    </div>
                                    <div className="pt-4 flex gap-3 border-t border-gray-50">
                                        <button 
                                            onClick={() => handleEditClick(pet)}
                                            className="flex-1 py-3 bg-orange-50 text-[#F97316] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-100 transition-colors"
                                        >
                                            Update Records
                                        </button>
                                        <button 
                                            onClick={() => handleDeletePet(pet.id)}
                                            className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Registration/Update Modal */}
            {isAddPetModalOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-[#1a1208]/60 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setIsAddPetModalOpen(false)}
                    />
                    <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                        <div className="px-10 pt-10 pb-6 flex justify-between items-center border-b border-gray-50">
                            <div>
                                <h2 className="text-3xl font-black text-[#1a1208] uppercase tracking-tight">{editingPetId ? 'Update Pet Info' : 'Register New Pet'}</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Keep your pet's records up to date for safety</p>
                            </div>
                            <button onClick={() => setIsAddPetModalOpen(false)} className="p-3 bg-gray-50 text-gray-400 hover:text-[#1a1208] rounded-2xl transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-[#1a1208] uppercase tracking-widest">Pet Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full h-14 bg-[#FAFAF9] border border-gray-100 rounded-2xl px-6 text-sm font-bold focus:outline-none focus:border-orange-200"
                                        placeholder="e.g. Bruno"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-[#1a1208] uppercase tracking-widest">Species</label>
                                    <div className="flex gap-4 h-14">
                                        {['Dog', 'Cat', 'Other'].map((type) => (
                                            <button 
                                                key={type}
                                                onClick={() => setFormData({...formData, species: type})}
                                                className={`flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                    formData.species === type ? 'bg-[#F97316] text-white border-[#F97316] shadow-lg shadow-orange-100' : 'bg-white text-gray-400 border-gray-100'
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-[#1a1208] uppercase tracking-widest">Breed</label>
                                    <input 
                                        type="text" 
                                        className="w-full h-14 bg-[#FAFAF9] border border-gray-100 rounded-2xl px-6 text-sm font-bold focus:outline-none focus:border-orange-200"
                                        placeholder="e.g. Aspin / Mixed"
                                        value={formData.breed}
                                        onChange={(e) => setFormData({...formData, breed: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-[#1a1208] uppercase tracking-widest">Age / Life Stage</label>
                                    <input 
                                        type="text" 
                                        className="w-full h-14 bg-[#FAFAF9] border border-gray-100 rounded-2xl px-6 text-sm font-bold focus:outline-none focus:border-orange-200"
                                        placeholder="e.g. 2 years / Puppy"
                                        value={formData.age}
                                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-[#1a1208] uppercase tracking-widest">Current Status</label>
                                    <select 
                                        className="w-full h-14 bg-[#FAFAF9] border border-gray-100 rounded-2xl px-6 text-sm font-bold focus:outline-none focus:border-orange-200"
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    >
                                        <option value="Healthy">Healthy</option>
                                        <option value="Under Treatment">Under Treatment</option>
                                        <option value="Missing">Missing</option>
                                        <option value="Recovered">Recovered</option>
                                        <option value="Deceased">Deceased</option>
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-[#1a1208] uppercase tracking-widest">Gender</label>
                                    <div className="flex gap-4 h-14">
                                        {['Male', 'Female'].map((g) => (
                                            <button 
                                                key={g}
                                                onClick={() => setFormData({...formData, gender: g})}
                                                className={`flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                    formData.gender === g ? 'bg-[#F97316] text-white border-[#F97316]' : 'bg-white text-gray-400 border-gray-100'
                                                }`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-[#1a1208] uppercase tracking-widest">Health Conditions & Special Instructions</label>
                                <textarea 
                                    className="w-full bg-[#FAFAF9] border border-gray-100 rounded-[2rem] p-6 text-sm font-medium focus:outline-none focus:border-orange-200 min-h-[120px]"
                                    placeholder="List any allergies, ongoing medications, or behavioral notes..."
                                    value={formData.condition}
                                    onChange={(e) => setFormData({...formData, condition: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="p-10 pt-0">
                            <Button
                                disabled={isSubmitting}
                                className={`w-full py-5 text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-[2rem] shadow-xl transition-all ${
                                    isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#F97316] shadow-orange-100 hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                                onClick={handleSubmit}
                            >
                                {isSubmitting ? 'Processing...' : (editingPetId ? 'Update Information' : 'Register Pet')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            <ResiMobileNav isNavbarMenuOpen={isNavbarMenuOpen} />
        </div>
    );
};

export default ResidentPet;
