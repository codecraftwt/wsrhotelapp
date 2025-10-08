import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Calendar } from 'react-native-calendars';

const CalendarModal = ({ visible, onClose, selectedDate, onSelectDate }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
       <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalContainer}>
           <TouchableWithoutFeedback>
            <View style={styles.calendarWrapper}>
          <Calendar
            current={selectedDate || undefined}
            onDayPress={day => {
              onSelectDate(day.dateString);
              onClose();
            }}
            markedDates={
              selectedDate
                ? { [selectedDate]: { selected: true, selectedColor: '#1c2f87' } }
                : {}
            }
            theme={{
              todayTextColor: '#1c2f87',
              selectedDayBackgroundColor: '#1c2f87',
              arrowColor: '#1c2f87',
            }}
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
           </TouchableWithoutFeedback>
        
      </View>
       </TouchableWithoutFeedback>
      
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  calendarWrapper: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
closeButton: {
    marginTop: 10,
    alignSelf: 'center',
    padding: 15,
    backgroundColor: '#1c2f87',
    borderRadius: 8,
  },
  closeButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default CalendarModal;
