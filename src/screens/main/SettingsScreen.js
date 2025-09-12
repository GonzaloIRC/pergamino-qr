import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const [locationServices, setLocationServices] = React.useState(true);

  const toggleDarkMode = () => setIsDarkMode(previousState => !previousState);
  const toggleNotifications = () => setNotifications(previousState => !previousState);
  const toggleLocationServices = () => setLocationServices(previousState => !previousState);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <View style={styles.card}>
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="moon-outline" size={20} color="#555" />
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              trackColor={{ false: "#ddd", true: "#a880eb" }}
              thumbColor={isDarkMode ? "#6200ee" : "#f4f3f4"}
              onValueChange={toggleDarkMode}
              value={isDarkMode}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="notifications-outline" size={20} color="#555" />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              trackColor={{ false: "#ddd", true: "#a880eb" }}
              thumbColor={notifications ? "#6200ee" : "#f4f3f4"}
              onValueChange={toggleNotifications}
              value={notifications}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="location-outline" size={20} color="#555" />
              <Text style={styles.settingLabel}>Location Services</Text>
            </View>
            <Switch
              trackColor={{ false: "#ddd", true: "#a880eb" }}
              thumbColor={locationServices ? "#6200ee" : "#f4f3f4"}
              onValueChange={toggleLocationServices}
              value={locationServices}
            />
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLabelContainer}>
              <Ionicons name="person-outline" size={20} color="#555" />
              <Text style={styles.menuLabel}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#aaa" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLabelContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#555" />
              <Text style={styles.menuLabel}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#aaa" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLabelContainer}>
              <Ionicons name="information-circle-outline" size={20} color="#555" />
              <Text style={styles.menuLabel}>About Pergamino</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#aaa" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLabelContainer}>
              <Ionicons name="document-text-outline" size={20} color="#555" />
              <Text style={styles.menuLabel}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#aaa" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLabelContainer}>
              <Ionicons name="shield-outline" size={20} color="#555" />
              <Text style={styles.menuLabel}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#aaa" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  versionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    color: '#999',
    fontSize: 14,
  },
});
