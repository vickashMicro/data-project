import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Admin Components
import AdminLogin from './components/AdminLogin';
import AdminHome from './components/AdminHome';
import CreateUser from './components/CreateUser';
import UploadFile from './components/UploadFile';
import CreateSheet from './components/CreateSheet';
import DeleteSheet from './components/DeleteSheet';
import UserDetails from './components/UserDetails';
import FormatOneDownload from './components/FormatOneDownload';
import FormatTwoDownload from './components/FormatTwoDownload';
import UserWiseDataDetail from './components/UserWiseDataDetail';
import Error from './components/Error';
import VolumeReport from './components/VolumeReport';
import MismatchReport from './components/MismatchReport'; // NEW IMPORT ADDED

// User Components
import UserLogin from './components/UserLogin';
import UserHome from './components/UserHome';
import FormatOne from './components/FormatOne';
import FormatTwo from './components/FormatTwo';
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/create-user" element={<CreateUser />} />
        <Route path="/upload-file" element={<UploadFile />} />
        <Route path="/create-sheet" element={<CreateSheet />} />
        <Route path="/delete-sheet" element={<DeleteSheet />} />
        <Route path="/user-details" element={<UserDetails />} />
        <Route path="/format-one-download" element={<FormatOneDownload />} />
        <Route path="/format-two-download" element={<FormatTwoDownload />} />
        <Route path="/user-wise-report" element={<UserWiseDataDetail />} />
        <Route path="/volume-report" element={<VolumeReport />} />
        <Route path="/mismatch-report" element={<MismatchReport />} /> {/* NEW ROUTE ADDED */}
        <Route path="/errors" element={<Error />} />

        {/* User Routes */}
        <Route path="/" element={<UserLogin />} />
        <Route path="/home" element={<UserHome />} />
        <Route path="/home-format1" element={<FormatOne />} />
        <Route path="/home-format2" element={<FormatTwo />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<UserLogin />} />
      </Routes>
    </Router>
  );
}

export default App;