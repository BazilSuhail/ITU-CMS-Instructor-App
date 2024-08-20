import React from 'react';
import { View, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const StudentAttendance = ({ student, attendance, onAttendanceChange }) => {
  const handleChange = (item) => {
    onAttendanceChange(student.id, item.value === 'true');
  };

  const getBackgroundColor = (value) => {
    if (value === 'true') {
      return 'bg-green-700'; // soft green
    }
    if (value === 'false') {
      return 'bg-red-500'; // soft red
    }
    return 'bg-gray-400'; // light gray
  };

  const selectedValue = attendance[student.id] !== undefined ? attendance[student.id].toString() : '';

  const getPlaceholderText = () => {
    if (selectedValue === 'true') {
      return 'Present';
    }
    if (selectedValue === 'false') {
      return 'Absent';
    }
    return 'Select';
  };

  const data = [
    { label: 'Select', value: '' },
    { label: 'Present', value: 'true' },
    { label: 'Absent', value: 'false' },
  ];

  return (
    <View className="flex-row items-center mt-[8px] justify-between px-2 py-[8px] bg-gray-100 rounded-md mx-4">
      <Text className="text-lg font-medium text-gray-800">{student.name}</Text>
      <View className={`w-[125px] h-[35px] pl-[32px] rounded-lg ${getBackgroundColor(selectedValue)} justify-center`}>
        <Dropdown
          data={data}
          labelField="label"
          valueField="value"
          value={selectedValue}
          onChange={handleChange}
          placeholder={getPlaceholderText()}
          placeholderStyle={{ color: 'white', fontWeight: '500' }} // White placeholder text
          itemContainerStyle={{ backgroundColor: 'gray-800',paddingLeft:"-32px" }} // Background color of dropdown items
          itemTextStyle={{ color: 'black' }} // White text for dropdown items
          selectedTextStyle={{ color: 'white' }} // White text for selected item
          style={{ padding: 0 }} // Remove extra padding
          renderRightIcon={() => null} // Hide the dropdown arrow icon
        />
      </View>
    </View>
  );
};

export default StudentAttendance;
