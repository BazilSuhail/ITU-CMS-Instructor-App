import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.header}>Update Attendance</Text>

      <Text>Select Date:</Text>
      <Picker
        selectedValue={viewDate}
        onValueChange={handleViewDateChange}
        style={styles.picker}
      >
        <Picker.Item label="Select a date" value="" />
        {attendanceDates.map(date => (
          <Picker.Item key={date} label={date} value={date} />
        ))}
      </Picker>

      {viewDate && (
        <View style={styles.tableContainer}>
          <Text style={styles.tableHeader}>Student's Name</Text>
          <Text style={styles.tableHeader}>Attendance Status</Text>
          <FlatList
            data={students}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <StudentAttendance
                student={item}
                attendance={attendance}
                onAttendanceChange={handleAttendanceChange}
              />
            )}
          />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003F92',
    marginBottom: 8,
  },
  picker: {
    height: 50,
    width: '100%',
    marginVertical: 5,
  },
  tableContainer: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#003F92',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#f1f1f1',
  },
  tableHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003F92',
    marginVertical: 5,
  },
});

export default EditAttendance;
