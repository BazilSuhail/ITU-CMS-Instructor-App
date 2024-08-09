import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { fs } from '../Config/Config';
import StudentAttendance from './StudentAttendance';
import { Picker } from '@react-native-picker/picker';

const EditAttendance = ({ assignCourseId, students, attendanceDates, latestAttendance }) => {
  const [viewDate, setViewDate] = useState('');
  const [attendance, setAttendance] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (latestAttendance) {
      setViewDate(latestAttendance.date);
      setAttendance(latestAttendance.records);
    }
  }, [latestAttendance]);

  const handleViewDateChange = async (date) => {
    setViewDate(date);

    try {
      const attendanceDocRef = fs.collection('attendances').doc(assignCourseId);
      const attendanceDoc = await attendanceDocRef.get();

      if (attendanceDoc.exists) {
        const attendanceData = attendanceDoc.data().attendances;
        const record = attendanceData.find(record => record.date === date);
        setAttendance(record ? record.records : {});
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      const attendanceDocRef = fs.collection('attendances').doc(assignCourseId);
      const attendanceDoc = await attendanceDocRef.get();

      if (attendanceDoc.exists) {
        const updatedAttendances = attendanceDoc.data().attendances.map(record =>
          record.date === viewDate ? { date: viewDate, records: attendance } : record
        );
        await attendanceDocRef.update({ attendances: updatedAttendances });
      } else {
        await attendanceDocRef.set({
          assignCourseId: assignCourseId,
          attendances: [
            {
              date: viewDate,
              records: attendance,
            },
          ],
        });
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <View className="flex">
      <Text className="text-lg font-bold text-blue-800 mb-2">Update Attendance</Text>

      <Text>Select Date:</Text>
      <Picker
        selectedValue={viewDate}
        onValueChange={handleViewDateChange}
        className="h-12 w-full my-2"
      >
        <Picker.Item label="Select a date" value="" />
        {attendanceDates.map(date => (
          <Picker.Item key={date} label={date} value={date} />
        ))}
      </Picker>

      {viewDate && (
        <View className="mt-4 rounded-md bg-white">
          <View className="flex-row justify-around">
            <Text className="text-lg font-bold text-blue-800 mb-2">Name</Text>
            <Text className="text-lg font-bold text-blue-800 mb-2">Attendance Status</Text>
          </View>
          {students.map(student => (
            <StudentAttendance
              key={student.id}
              student={student}
              attendance={attendance}
              onAttendanceChange={handleAttendanceChange}
            />
          ))}
          <Button
            title="Update Attendance"
            onPress={handleSaveAttendance}
            disabled={!viewDate}
          />
        </View>
      )}
      {error && <Text>Error: {error}</Text>}
    </View>
  );
};

export default EditAttendance;
