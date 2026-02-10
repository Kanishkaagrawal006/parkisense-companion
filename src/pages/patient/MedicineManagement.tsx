import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Pill,
  Clock,
  Loader2,
  Edit2,
  Save,
  X,
} from 'lucide-react';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface MedicineEntry {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  notes?: string;
}

const MedicineManagement = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useFirebaseAuth();
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<MedicineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'Once daily',
    time: '08:00',
    notes: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/patient/auth');
      return;
    }
    if (user) loadMedicines();
  }, [user, authLoading]);

  const loadMedicines = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'medicines'), where('patientId', '==', user.id));
      const snapshot = await getDocs(q);
      const meds: MedicineEntry[] = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as MedicineEntry[];
      setMedicines(meds);
    } catch (error) {
      console.error('Error loading medicines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!user || !formData.name.trim() || !formData.dosage.trim()) {
      toast({ title: 'Missing fields', description: 'Name and dosage are required', variant: 'destructive' });
      return;
    }

    try {
      await addDoc(collection(db, 'medicines'), {
        patientId: user.id,
        name: formData.name.trim(),
        dosage: formData.dosage.trim(),
        frequency: formData.frequency,
        time: formData.time,
        notes: formData.notes.trim(),
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Medicine Added! 💊', description: `${formData.name} has been added.` });
      setFormData({ name: '', dosage: '', frequency: 'Once daily', time: '08:00', notes: '' });
      setShowAddForm(false);
      loadMedicines();
    } catch (error) {
      console.error('Error adding medicine:', error);
      toast({ title: 'Error', description: 'Failed to add medicine', variant: 'destructive' });
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateDoc(doc(db, 'medicines', id), {
        name: formData.name.trim(),
        dosage: formData.dosage.trim(),
        frequency: formData.frequency,
        time: formData.time,
        notes: formData.notes.trim(),
      });
      toast({ title: 'Updated! ✏️', description: 'Medicine details updated.' });
      setEditingId(null);
      loadMedicines();
    } catch (error) {
      console.error('Error updating medicine:', error);
      toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteDoc(doc(db, 'medicines', id));
      toast({ title: 'Removed', description: `${name} has been removed.` });
      loadMedicines();
    } catch (error) {
      console.error('Error deleting medicine:', error);
      toast({ title: 'Error', description: 'Failed to remove medicine', variant: 'destructive' });
    }
  };

  const startEdit = (med: MedicineEntry) => {
    setEditingId(med.id);
    setFormData({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      time: med.time,
      notes: med.notes || '',
    });
  };

  const frequencyOptions = ['Once daily', 'Twice daily', 'Three times daily', 'Every 8 hours', 'Every 12 hours', 'As needed'];

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-soft px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patient/dashboard')}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">My Medicines</h1>
            <p className="text-sm text-muted-foreground">Manage your medication list</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 max-w-lg mx-auto space-y-6">
        {/* Add Button */}
        {!showAddForm && (
          <Button onClick={() => { setShowAddForm(true); setEditingId(null); setFormData({ name: '', dosage: '', frequency: 'Once daily', time: '08:00', notes: '' }); }} className="w-full" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add New Medicine
          </Button>
        )}

        {/* Add / Edit Form */}
        {(showAddForm || editingId) && (
          <Card className="border-2 border-primary/20 animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                {editingId ? 'Edit Medicine' : 'Add Medicine'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Medicine Name *</Label>
                <Input placeholder="e.g., Levodopa" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>Dosage *</Label>
                <Input placeholder="e.g., 100mg" value={formData.dosage} onChange={e => setFormData(p => ({ ...p, dosage: e.target.value }))} maxLength={50} />
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <select
                  className="flex h-14 w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-lg focus:outline-none focus:border-primary transition-all"
                  value={formData.frequency}
                  onChange={e => setFormData(p => ({ ...p, frequency: e.target.value }))}
                >
                  {frequencyOptions.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Scheduled Time
                </Label>
                <Input type="time" value={formData.time} onChange={e => setFormData(p => ({ ...p, time: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input placeholder="e.g., Take with food" value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} maxLength={200} />
              </div>
              <div className="flex gap-3">
                <Button onClick={() => editingId ? handleUpdate(editingId) : handleAdd()} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Update' : 'Save'}
                </Button>
                <Button variant="outline" onClick={() => { setShowAddForm(false); setEditingId(null); }}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Medicine List */}
        {medicines.length === 0 && !showAddForm ? (
          <Card className="border-0 shadow-card">
            <CardContent className="py-12 text-center">
              <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No medicines added yet</p>
              <p className="text-muted-foreground text-sm mt-1">Tap the button above to add your first medicine</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {medicines.map((med, index) => (
              <Card key={med.id} className="border-0 shadow-card animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                      <Pill className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground">{med.name}</h3>
                      <p className="text-sm text-muted-foreground">{med.dosage} • {med.frequency}</p>
                      <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{med.time}</span>
                      </div>
                      {med.notes && <p className="text-xs text-muted-foreground mt-1 italic">{med.notes}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(med)} className="h-9 w-9">
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(med.id, med.name)} className="h-9 w-9">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MedicineManagement;
