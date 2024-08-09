import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const StudentAttendance = ({ student, attendance, onAttendanceChange }) => {
  const handleChange = (status) => {
    onAttendanceChange(student.id, status === 'true');
  };

  const getBackgroundColor = (value) => {
    if (value === 'true') {
      return '#388E3C'; // green
    }
    if (value === 'false') {
      return '#D32F2F'; // red
    }
    return '';
  };

  const selectedValue = attendance[student.id] !== undefined ? attendance[student.id].toString() : '';

  return (
    <View style={[styles.row, { backgroundColor: getBackgroundColor(selectedValue) }]}>
      <Text style={styles.cell}>{student.name}</Text>
      <Picker
        selectedValue={selectedValue}
        onValueChange={handleChange}
        style={styles.picker}
      >
        <Picker.Item label="Select" value="" />
        <Picker.Item label="Present" value="true" />
        <Picker.Item label="Absent" value="false" />
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cell: {
    fontSize: 16,
    flex: 1,
  },
  picker: {
    flex: 1,
    height: 50,
  },
});

export default StudentAttendance;
