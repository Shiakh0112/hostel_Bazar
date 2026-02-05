import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOwnerHostels } from '../../../app/slices/hostelSlice';
import HostelForm from '../../hostel/HostelForm';
import Loader from '../../common/Loader';

const HostelEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { ownerHostels, isLoading } = useSelector((state) => state.hostel);
  const [hostel, setHostel] = useState(null);

  useEffect(() => {
    if (ownerHostels.length === 0) {
      dispatch(fetchOwnerHostels());
    }
  }, [dispatch, ownerHostels.length]);

  useEffect(() => {
    if (id && ownerHostels.length > 0) {
      const foundHostel = ownerHostels.find(h => h._id === id);
      setHostel(foundHostel);
    }
  }, [id, ownerHostels]);

  const handleSuccess = () => {
    navigate('/dashboard/owner/hostels');
  };

  const handleClose = () => {
    navigate('/dashboard/owner/hostels');
  };

  if (isLoading) return <Loader />;

  if (!hostel) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Hostel not found</h2>
        <button 
          onClick={() => navigate('/dashboard/owner/hostels')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Back to Hostels
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Hostel</h1>
        <p className="text-gray-600">Update {hostel.name} details</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border">
        <HostelForm 
          hostel={hostel}
          isEdit={true}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
};

export default HostelEdit;