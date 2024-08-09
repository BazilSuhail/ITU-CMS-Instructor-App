import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, ActivityIndicator, Modal, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fs } from '../Config/Config';
import StudentAttendance from './StudentAttendance';
import EditAttendance from './EditAttendance';

const Attendance = ({ route }) => {
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
  const [editForm, setEditForm] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

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
            const attendanceData = attendanceDoc.data().attendances;
            setAttendanceDates(attendanceData.map(record => record.date));

            if (attendanceData.length > 0) {
              const latest = attendanceData.reduce((latestRecord, currentRecord) => {
                return new Date(latestRecord.date) > new Date(currentRecord.date) ? latestRecord : currentRecord;
              });
              setLatestAttendance(latest);
            }
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
          attendances: [...attendanceDoc.data().attendances, {
            date: selectedDate,
            records: attendance,
          }],
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
        const updatedAttendanceData = updatedAttendanceDoc.data().attendances;
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

  const isSaveEnabled = () => {
    if (!selectedDate) return false;
    if (students.length === 0) return false;
    for (const student of students) {
      if (!attendance.hasOwnProperty(student.id)) return false;
    }
    return true;
  };

  const handleDateConfirm = (event, selectedDate) => {
    if (event.type === 'set') {
      setSelectedDate(selectedDate.toISOString().split('T')[0]);
    }
    setShowDatePicker(false);
  };

  const renderHeader = () => (
    <>
      {courseData && (
        <>
          <Text className="text-2xl font-bold text-blue-800 text-center my-3">{courseData.courseName} Attendance</Text>
          <View className="w-11/12 h-1 bg-blue-800 self-center mb-3"></View>
        </>
      )}
      {formLoading && <Text>Loading...</Text>}
    </>
  );

  const renderItem = ({ item }) => (
    <StudentAttendance
      student={item}
      attendance={attendance}
      onAttendanceChange={handleAttendanceChange}
    />
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#003F92" />
      </View>
    );
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View className="flex-1 p-4">
      <FlatList
        ListHeaderComponent={
          <>
            {renderHeader()}
            {!formLoading && (
              <View className="my-2 p-4 bg-gray-200 rounded-lg">
                <Text className="text-xl text-blue-800 mb-2 font-bold">Mark Attendance</Text>
                <TouchableOpacity className="border-2 border-blue-800 p-3 mb-2 rounded bg-white" onPress={() => setShowDatePicker(true)}>
                  <Text className="text-blue-800">{selectedDate ? selectedDate : 'Select Date'}</Text>
                </TouchableOpacity>
                <Button
                  title="Save Attendance"
                  onPress={handleSaveAttendance}
                  disabled={!isSaveEnabled()}
                />
                <Button
                  title={editForm ? 'Close Review' : 'Show Attendance Records'}
                  onPress={() => setEditForm(!editForm)}
                />
                {editForm && (
                  <EditAttendance
                    assignCourseId={assignCourseId}
                    students={students}
                    attendanceDates={attendanceDates}
                    latestAttendance={latestAttendance}
                  />
                )}
              </View>
            )}
          </>
        }
        data={students}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1 }}
      />

      {/* Date Picker Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={showDatePicker}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-4 rounded-lg w-4/5">
            <DateTimePicker
              value={selectedDate ? new Date(selectedDate) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateConfirm}
            />
            <Button title="Close" onPress={() => setShowDatePicker(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Attendance;
