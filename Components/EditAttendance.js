import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import { fs } from '../Config/Config';
import StudentAttendance from './StudentAttendance';
import { Picker } from '@react-native-picker/picker';


const EditAttendance = ({ assignCourseId, students, attendanceDates = [] }) => {
  const [viewDate, setViewDate] = useState('');
  const [attendance, setAttendance] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (viewDate) {
      fetchAttendanceForDate(viewDate);
    }
  }, [viewDate]);

  const fetchAttendanceForDate = async (date) => {
    try {
      const attendanceDocRef = fs.collection('attendances').doc(assignCourseId);
      const attendanceDoc = await attendanceDocRef.get();

      if (attendanceDoc.exists) {
        const attendanceData = attendanceDoc.data().attendances || [];
        const record = attendanceData.find(record => record.date === date);
        setAttendance(record ? record.records : {});
      } else {
        setAttendance({});
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
        const existingAttendances = attendanceDoc.data().attendances || [];
        const updatedAttendances = existingAttendances.map(record =>
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

      <Text className="text-blue-900 font-semibold text-lg underline">Select a Date to Update:</Text>
      <View
        style={{
          backgroundColor: "#001433", 
          borderRadius: 15, 
          overflow: 'hidden', 
          margin: 5, 
        }}
      >
        <Picker
          selectedValue={viewDate}
          onValueChange={(date) => setViewDate(date)}
          style={{
            height: 50, 
            width: '100%', 
            color: '#FFFFFF',
          }}
        >
          <Picker.Item label="Select a date" value="" />
          {attendanceDates.length > 0 ? (
            attendanceDates.map(date => (
              <Picker.Item key={date} label={date} value={date} />
            ))
          ) : (
            <Picker.Item label="No dates available" value="" />
          )}
        </Picker>
      </View>

      {!viewDate && (
        <Text className="text-red-400 mt-[8px] underline text-[14px] font-medium">
          Select Date to Update Attendance of Any Students *
        </Text>
      )}
      
      {viewDate && (
        <View className="my-2 pb-3 rounded-md bg-white">
          <View className="flex-row justify-around">
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

          {/*
          <Button
            title="Update Attendance"
            onPress={handleSaveAttendance}
            disabled={!viewDate}
          />*/}
        </View>
      )}

      {viewDate && (
        <TouchableOpacity className="bg-green-800 p-3 mt-[55px] mb-2 rounded-xl" onPress={handleSaveAttendance}>
          <Text className="text-blue-50 text-center text-lg font-medium">Update Attendance</Text>
        </TouchableOpacity>
      )}

      {error && <Text>Error: {error}</Text>}
    </View>
  );
};

export default EditAttendance;
