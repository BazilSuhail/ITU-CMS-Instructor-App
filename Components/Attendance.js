import React, { useState, useEffect } from 'react';
import { View, Text, Button, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fs } from '../Config/Config';
import StudentAttendance from './StudentAttendance';
import EditAttendance from './EditAttendance';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Header Component
const Heading = ({ courseData, onBack, onUpdateAttendance, onMarkAttendance }) => (
  <>
    <View className="flex justify-between mb-2">
      <View className="flex-row items-center">
        <Ionicons name="arrow-back" onPress={onBack} size={26} color="#003F92" />
        {courseData && (
          <Text className="text-xl ml-[8px] font-bold text-blue-700 text-center my-3">
            {courseData.courseName} <Text className="text-blue-900">Attendance</Text>
          </Text>
        )}
      </View>
      <View className="w-[100%] h-[2px] bg-blue-800 self-center mb-3"></View>
    </View>
    <View className="flex-row justify-between mb-3">
      <TouchableOpacity className="bg-blue-950 p-3 mb-2 rounded-xl" onPress={onMarkAttendance}>
        <Text className="text-blue-50 text-center text-lg font-medium">Mark Attendance</Text>
      </TouchableOpacity>
      <TouchableOpacity className="bg-blue-950 p-3 mb-2 rounded-xl" onPress={onUpdateAttendance}>
        <Text className="text-blue-50 text-center text-lg font-medium">Update Attendance</Text>
      </TouchableOpacity>
    </View>
  </>
);

// Header Component
const Header = ({ formLoading, selectedDate, setShowDatePicker, handleSaveAttendance, isSaveEnabled }) => (
  <>
    {formLoading && <Text>Loading...</Text>}
    {!formLoading && (
      <View className="p-1 rounded-lg">
        <Text className="text-blue-900 font-semibold text-lg mb-[5px] underline">Select a Date:</Text>
        <TouchableOpacity className="bg-blue-950 p-3 mb-2 rounded-xl" onPress={() => setShowDatePicker(true)}>
          <Text className="text-blue-50 text-center text-lg font-medium">
            {selectedDate ? selectedDate : 'Select Date'}
          </Text>
        </TouchableOpacity>

        {isSaveEnabled() ? (
          <TouchableOpacity className="bg-green-600 p-3 mb-2 rounded-xl" onPress={handleSaveAttendance}>
            <Text className="text-blue-50 text-center text-lg font-medium">Save Attendance</Text>
          </TouchableOpacity>
        ) : (
          <>
            <View className="bg-gray-400 p-3 mb-2 rounded-xl">
              <Text className="text-gray-500 text-center text-lg font-medium">Save Attendance</Text>
            </View>
            <Text className="text-red-600 text-[14px] font-medium">
              Select Date and Mark Attendance of All Students to Save Attendance*
            </Text>
          </>
        )}
      </View>
    )}
  </>
);

// DatePicker Modal Component
const DatePickerModal = ({ showDatePicker, handleDateConfirm, setShowDatePicker }) => (
  <Modal
    transparent={true}
    animationType="slide"
    visible={showDatePicker}
    onRequestClose={() => setShowDatePicker(false)}
  >
    <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
      <View className="bg-white p-4 rounded-lg w-4/5">
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={handleDateConfirm}
        />
        <Button title="Close" onPress={() => setShowDatePicker(false)} />
      </View>
    </View>
  </Modal>
);

// MarkAttendance Component
const MarkAttendance = ({ students, attendance, handleAttendanceChange, selectedDate, handleSaveAttendance, isSaveEnabled }) => (
  <View className="mb-4 bg-white rounded-lg py-2">
    <View className="flex-row justify-between px-4">
      <Text className="text-lg font-bold text-blue-800 mb-2">Name</Text>
      <Text className="text-lg font-bold text-blue-800 mb-2">Attendance Status</Text>
    </View>
    {students.length > 0 ? (
      students.map(student => (
        <StudentAttendance
          key={student.id}
          student={student}
          attendance={attendance}
          onAttendanceChange={handleAttendanceChange}
        />
      ))
    ) : (
      <Text>No students available</Text>
    )}
  </View>
);

const Attendance = ({ route }) => {
  const navigation = useNavigation();
  const { assignCourseId } = route.params;
  const [courseData, setCourseData] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [latestAttendance, setLatestAttendance] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [viewMode, setViewMode] = useState('mark'); // 'mark' or 'update'

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const assignmentDoc = await fs.collection('assignCourses').doc(assignCourseId).get();
        if (assignmentDoc.exists) {
          const assignmentData = assignmentDoc.data();

          const courseDoc = await fs.collection('courses').doc(assignmentData.courseId).get();
          setCourseData({
            courseName: courseDoc.data().name,
            courseId: assignmentData.courseId,
          });

          const studentsSnapshot = await fs.collection('students').get();
          const studentsList = studentsSnapshot.docs
            .filter(doc => doc.data().currentCourses.includes(assignCourseId))
            .map(doc => ({
              id: doc.id,
              name: doc.data().name,
            }));

          setStudents(studentsList);

          const attendanceDocRef = fs.collection('attendances').doc(assignCourseId);
          const attendanceDoc = await attendanceDocRef.get();

          if (attendanceDoc.exists) {
            const attendanceData = attendanceDoc.data().attendances || [];
            setAttendanceDates(attendanceData.map(record => record.date));

            if (attendanceData.length > 0) {
              const latest = attendanceData.reduce((latestRecord, currentRecord) => {
                return new Date(latestRecord.date) > new Date(currentRecord.date) ? latestRecord : currentRecord;
              });
              setLatestAttendance(latest);
            }
          } else {
            setAttendanceDates([]); // Ensure this is set even if no document exists
          }
        } else {
          setError('No assignment data found');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [assignCourseId]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    setFormLoading(true);
    try {
      const attendanceDocRef = fs.collection('attendances').doc(assignCourseId);
      const attendanceDoc = await attendanceDocRef.get();

      if (attendanceDoc.exists) {
        await attendanceDocRef.update({
          attendances: [
            ...attendanceDoc.data().attendances,
            {
              date: selectedDate,
              records: attendance,
            },
          ],
        });
      } else {
        await attendanceDocRef.set({
          assignCourseId: assignCourseId,
          attendances: [
            {
              date: selectedDate,
              records: attendance,
            },
          ],
        });
      }

      setSelectedDate(null);
      setAttendance({});

      const updatedAttendanceDoc = await attendanceDocRef.get();
      if (updatedAttendanceDoc.exists) {
        const updatedAttendanceData = updatedAttendanceDoc.data().attendances || [];
        const latest = updatedAttendanceData.reduce((latestRecord, currentRecord) => {
          return new Date(latestRecord.date) > new Date(currentRecord.date) ? latestRecord : currentRecord;
        });
        setLatestAttendance(latest);
        setAttendanceDates(updatedAttendanceData.map(record => record.date));
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDateConfirm = (event, date) => {
    if (date) {
      setSelectedDate(date.toISOString().split('T')[0]);
      setShowDatePicker(false);
    }
  };

  const isSaveEnabled = () => selectedDate && Object.keys(attendance).length > 0;

  return (
    <View className="flex px-4 pt-[48px] bg-gray-100">

      <Heading
        courseData={courseData}
        onBack={() => navigation.goBack()}
        onMarkAttendance={() => setViewMode('mark')}
        onUpdateAttendance={() => setViewMode('update')}
      />
      {error && <Text className="text-red-600">{error}</Text>}
      {loading ? (
        <View className="flex justify-center items-center h-screen">
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : viewMode === 'mark' ? (
        <>
          <Header
            formLoading={formLoading}
            selectedDate={selectedDate}
            setShowDatePicker={setShowDatePicker}
            handleSaveAttendance={handleSaveAttendance}
            isSaveEnabled={isSaveEnabled}
          />
          <MarkAttendance
            students={students}
            attendance={attendance}
            handleAttendanceChange={handleAttendanceChange}
            selectedDate={selectedDate}
            handleSaveAttendance={handleSaveAttendance}
            isSaveEnabled={isSaveEnabled}
          />
        </>
      ) : (
        <EditAttendance
          assignCourseId={assignCourseId}
          students={students}
          attendanceDates={attendanceDates}
        />
      )}
      <DatePickerModal
        showDatePicker={showDatePicker}
        handleDateConfirm={handleDateConfirm}
        setShowDatePicker={setShowDatePicker}
      />
    </View>
  );
};

export default Attendance;
