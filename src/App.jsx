import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";

// Context providers
import { InstitutesContextProvider } from "./context/InstitutesContext.jsx";
import { PaymentsContextProvider } from "./context/PaymentContext.jsx";
import { ClassContextProvider } from "./context/ClassContext.jsx";
import { AttendanceContextProvider } from "./context/AttendanceContext.jsx";
import { TuteContextProvider } from "./context/TuteContext.jsx";
import { StudentContextProvider } from "./context/StudentContext.jsx";
import { AdminContextProvider } from "./context/AdminContext.jsx";
import { EmailContextProvider } from "./context/EmailContext.jsx";

// Pages and components
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import SuperAdminRegister from "./pages/SuperAdminRegister";
import AdminLogin from "./pages/AdminLogin.jsx";
import Home from "./pages/Home.jsx";
import HomeSubAdmin from "./pages/HomeSubAdmin.jsx";
import Student from "./pages/Student.jsx";
import CreateStudent from "./pages/CreateStudent.jsx";
import QrScn from "./pages/QrScanner.jsx";
import CreatePayment from "./pages/Payments.jsx";
import Class from "./pages/Clz.jsx";
import Attendance from "./pages/Attendance.jsx";
import UserRoleAuth from "./Auth/UserRoleAuth.jsx";
import StudentProfile from "./pages/StudentProfile.jsx";
import AbsentStudents from "./pages/AbsentStudents.jsx";
import StartClass from "./pages/StartClass.jsx";
import StudentPayment from "./pages/StudentPayments.jsx";
import TeachersIncome from "./pages/TeachersIncome.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import SuperAdminDashboardAdmins from "./pages/SuperAdminDashboardAdmins.jsx";
import SuperAdminNavBar from "./components/NavBar/SuperAdminNavBar.jsx";
import NavBar from "./components/NavBar/NavBar.jsx";
import UpdateStudent from "./pages/UpdateStudent.jsx";
import SuperAdminForgotPassword from "./pages/SuperAdminForgotPassword.jsx";
import SuperAdminResetPassword from "./pages/SuperAdminResetPassword.jsx";
import InstituteIncome from "./pages/InstituteIncome.jsx";

// Styling imports
import "./components/NavBar/NavBar.css";
import UpdateClass from "./pages/UpdateClass.jsx";

import HomeSclAdmin from "./pages/HomeSclAdmin.jsx";
import StartSchool from "./pages/StartSchool.jsx";
import BrodcastMsg from "./pages/BrodcastMsg.jsx";
import AbsentSclStds from "./pages/AbsentSclStds.jsx";
import SwimAdminHome from "./pages/SwimAdminHome.jsx";
import SwminInQrScanner from "./pages/SwminInQrScanner.jsx";
import SwimOutQrScanner from "./pages/SwimOutQrScanner.jsx";

function App() {
  const { user } = useAuthContext();

  const checkUserRole = (userRolee) => {
    return user && user.role === userRolee;
  };

  return (
    <div className="App">
      <BrowserRouter>
        <div className="pages">
          <Routes>
            {/* --------- Common Routes ---------*/}
            <Route
              path="/login"
              element={
                checkUserRole("SUPER_ADMIN") ? (
                  <Navigate to="/sadmin" />
                ) : (
                  <SuperAdminLogin />
                )
              }
            />

            {/* <Route
              path="/adminlogin"
              element={
                checkUserRole("ADMIN") ? (
                  <Navigate to="/" />
                ) : checkUserRole("SUB_ADMIN") ? (
                  <Navigate to="/subadminhome" />
                ) : (
                  <AdminLogin />
                )
              }
            /> */}
            <Route 
  path="/adminlogin"
  element={
    checkUserRole("ADMIN") ? (
      <Navigate to="/" />
    ) : checkUserRole("SUB_ADMIN") ? (
      <Navigate to="/subadminhome" />
    ) : checkUserRole("SCL_ADMIN") ? (
      <Navigate to="/scladminhome" />
    ) : checkUserRole("SWIM_ADMIN") ? (
      <Navigate to="/swimadminhome" />
    ) : (
      <AdminLogin />
    )
  }
/>


            <Route path="/forgotpass" element={<ForgotPassword />} />

            <Route
              path="/resetpassword/:adminId/:token"
              element={<ResetPassword />}
            />

            <Route
              path="/spforgotpass"
              element={<SuperAdminForgotPassword />}
            />

            <Route
              path="/spresetpassword/:adminId/:token"
              element={<SuperAdminResetPassword />}
            />

            {/* --------- --------- ---------*/}

            {/* --------- Super Admin Routes ---------*/}

            <Route
              path="/sadmin"
              element={
                <InstitutesContextProvider>
                  <AdminContextProvider>
                    <SuperAdminNavBar />
                    <UserRoleAuth userRole={"SUPER_ADMIN"} />
                  </AdminContextProvider>
                </InstitutesContextProvider>
              }
            >
              {/* <Route element={<SuperAdminNavBar />} /> */}
              <Route path="/sadmin" element={<SuperAdminDashboard />} />
              <Route
                path="/sadmin/instituteadmins/:id"
                element={<SuperAdminDashboardAdmins />}
              />
            </Route>

            {/* --------- --------  -------- ---------*/}

            {/* --------- Admin Routes ---------*/}

            <Route
              path="/"
              element={
                <StudentContextProvider>
                  <ClassContextProvider>
                    <AttendanceContextProvider>
                      <TuteContextProvider>
                        <PaymentsContextProvider>
                          <EmailContextProvider>
                            
                              {/* <React.Fragment> */}
                              <div className="navbar-wrapper">
                                <NavBar />
                              </div>
                              <UserRoleAuth userRole={"ADMIN"} />
                              {/* </React.Fragment> */}
                            
                          </EmailContextProvider>
                        </PaymentsContextProvider>
                      </TuteContextProvider>
                    </AttendanceContextProvider>
                  </ClassContextProvider>
                </StudentContextProvider>
              }
            >
              <Route path="/" element={<Home />} />
              <Route path="/students" element={<Student />} />
              <Route path="/payments" element={<StudentPayment />} />
              <Route path="/createSTD" element={<CreateStudent />} />
              <Route path="/startClass/qrScanner/:id" element={<QrScn />} />
              <Route
                path="/startClass/absent/:id"
                element={<AbsentStudents />}
              />
              <Route path="/payment/:id" element={<CreatePayment />} />
              <Route path="/classes" element={<Class />} />
              <Route path="/attendences" element={<Attendance />} />
              <Route path="/brodcastMsg" element={<BrodcastMsg/>} /> 
              {/* <Route path="/createClass" element={<CreateClass />} /> */}
              <Route
                path="/studentprofile/:studentId"
                element={<StudentProfile />}
              />
              <Route path="/updateStd/:id" element={<UpdateStudent />} />
              <Route path="/updateClz/:id" element={<UpdateClass />} />
              <Route path="/teacherIncome/:id" element={<TeachersIncome />}/>
              <Route path="/instituteIncome" element={<InstituteIncome />} />

              <Route path="/absent" element={<AbsentStudents />} />
              <Route path="/absentScl" element={<AbsentSclStds />} />
              <Route path="/startClass" element={<StartClass />} />
              <Route path="/startSchool" element={<StartSchool/>}/>
            </Route>

            {/* ---------  ----------  ---------*/}

            {/* --------- Sub Admin Routes ---------*/}

            <Route
              path="/subadminhome"
              element={
                <StudentContextProvider>
                  <ClassContextProvider>
                    <AttendanceContextProvider>
                      <TuteContextProvider>
                        <PaymentsContextProvider>
                          <EmailContextProvider>
                            <UserRoleAuth userRole={"SUB_ADMIN"} />
                          </EmailContextProvider>
                        </PaymentsContextProvider>
                      </TuteContextProvider>
                    </AttendanceContextProvider>
                  </ClassContextProvider>
                </StudentContextProvider>
              }
            >
              <Route path="/subadminhome" element={<HomeSubAdmin />} />

              <Route path="/subadminhome/startClass" element={<StartClass />} />
              <Route
                path="/subadminhome/startClass/qrScanner/:id"
                element={<QrScn />}
              />
              <Route
                path="/subadminhome/startClass/absent/:id"
                element={<AbsentStudents />}
              />
              
            </Route>
            {/* --------- -------  ------- ---------*/}

            {/*----------- school admin------------- */}
            <Route
              path="/scladminhome"
              element={
                <StudentContextProvider>
                  <ClassContextProvider>
                    <AttendanceContextProvider>
                      <EmailContextProvider>
                        <UserRoleAuth userRole={"SCL_ADMIN"} />
                      </EmailContextProvider>
                    </AttendanceContextProvider>
                  </ClassContextProvider>
                </StudentContextProvider>
              }
            > 
            
            <Route path="/scladminhome" element={<HomeSclAdmin />} />
            <Route path="/scladminhome/startSchool" element={<StartSchool />} />
            <Route
                path="/scladminhome/absentScl"
                element={<AbsentSclStds />}
              />
            </Route>


            {/* -----------Swim ADMIN----------------- */}
            <Route
              path="/swimadminhome"
              element={
                <StudentContextProvider>
                  <ClassContextProvider>
                    <AttendanceContextProvider>
                      <EmailContextProvider>
                        <UserRoleAuth userRole={"SWIM_ADMIN"} />
                      </EmailContextProvider>
                    </AttendanceContextProvider>
                  </ClassContextProvider>
                </StudentContextProvider>
              }
            > 
            
            <Route path="/swimadminhome" element={<SwimAdminHome />} />
            <Route path="/swimadminhome/swimInQr/:id" element={<SwminInQrScanner />} />
            <Route path="/swimadminhome/swimOutQr" element={<SwimOutQrScanner />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;

//Consider adding an error boundary to your tree to customize error handling behavior.
