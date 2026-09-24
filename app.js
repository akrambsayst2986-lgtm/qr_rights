import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  Platform,
  Linking,
} from 'react-native';

// Validation patterns for social media URLs
const SOCIAL_PATTERNS = {
  facebook: /^(https?:\/\/)?(www\.)?facebook\.com\/[\w\-\.]+\/?$/i,
  instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/[\w\.]+\/?$/i,
  twitter: /^(https?:\/\/)?(www\.)?twitter\.com\/[\w]+\/?$/i,
  tiktok: /^(https?:\/\/)?(www\.)?tiktok\.com\/@[\w\.]+\/?$/i,
  youtube: /^(https?:\/\/)?(www\.|m\.)?youtube\.com\/(user|channel|c)\/[\w\-]+\/?$/i,
  reddit: /^(https?:\/\/)?(www\.)?reddit\.com\/(u|user)\/[\w\-]+\/?$/i,
  discord: /^(https?:\/\/)?(www\.)?discord\.gg\/[\w]+\/?$/i,
};

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', icon: '📷', color: '#E1306C' },
  { id: 'twitter', name: 'Twitter', icon: '🐦', color: '#1DA1F2' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000' },
  { id: 'youtube', name: 'YouTube', icon: '📺', color: '#FF0000' },
  { id: 'reddit', name: 'Reddit', icon: '🔴', color: '#FF4500' },
  { id: 'discord', name: 'Discord', icon: '💬', color: '#5865F2' },
];

const validateURL = (url, platform) => {
  if (!url.trim()) return true; // Empty is valid (optional)
  
  const pattern = SOCIAL_PATTERNS[platform];
  if (!pattern) return true;
  
  return pattern.test(url);
};

export default function App() {
  const [activeTab, setActiveTab] = useState('create');
  const [showAbout, setShowAbout] = useState(false);
  const [creatorName, setCreatorName] = useState('');
  const [creatorBio, setCreatorBio] = useState('');
  
  // Social accounts - up to 3 per platform
  const [socialAccounts, setSocialAccounts] = useState(
    PLATFORMS.reduce((acc, platform) => {
      acc[platform.id] = ['', '', ''];
      return acc;
    }, {})
  );

  const [displayProfile, setDisplayProfile] = useState(null);
  const [errors, setErrors] = useState({});

  const updateSocialAccount = (platform, index, value) => {
    setSocialAccounts(prev => ({
      ...prev,
      [platform]: [
        ...prev[platform].slice(0, index),
        value,
        ...prev[platform].slice(index + 1)
      ]
    }));
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      [`${platform}-${index}`]: null
    }));
  };

  const validateAndGenerate = () => {
    if (!creatorName.trim()) {
      Alert.alert('خطأ', 'الرجاء إدخال اسمك');
      return;
    }

    const newErrors = {};
    let hasErrors = false;

    // Validate all social URLs
    Object.keys(socialAccounts).forEach(platform => {
      socialAccounts[platform].forEach((url, index) => {
        if (url.trim() && !validateURL(url, platform)) {
          newErrors[`${platform}-${index}`] = 'صيغة الرابط غير صحيحة';
          hasErrors = true;
        }
      });
    });

    if (hasErrors) {
      setErrors(newErrors);
      Alert.alert('تحذير', 'بعض الروابط غير صحيحة. تحقق من الصيغة');
      return;
    }

    // Filter out empty accounts
    const activeAccounts = {};
    Object.keys(socialAccounts).forEach(platform => {
      activeAccounts[platform] = socialAccounts[platform].filter(url => url.trim());
    });

    const profileData = {
      name: creatorName,
      bio: creatorBio,
      socials: activeAccounts,
      timestamp: new Date().toISOString(),
    };

    setDisplayProfile(profileData);
  };

  const generateJSON = () => {
    if (!displayProfile) return '';
    return JSON.stringify(displayProfile);
  };

  const handleReset = () => {
    setCreatorName('');
    setCreatorBio('');
    setSocialAccounts(
      PLATFORMS.reduce((acc, platform) => {
        acc[platform.id] = ['', '', ''];
        return acc;
      }, {})
    );
    setDisplayProfile(null);
    setErrors({});
  };

  return (
    <View style={styles.container}>
      {/* About Developer Modal */}
      {showAbout && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAbout(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>👨‍💻 حول المطور</Text>
            
            <View style={styles.developerCard}>
              <Text style={styles.developerName}>Alexei</Text>
              <Text style={styles.developerRole}>محمول و ويب</Text>

              <TouchableOpacity
                style={[styles.socialButton, { backgroundColor: '#1877F2' }]}
                onPress={() => Linking.openURL('https://www.facebook.com/Alexei2986')}
              >
                <Text style={styles.socialButtonText}>📘 Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, { backgroundColor: '#E1306C' }]}
                onPress={() => Linking.openURL('https://www.instagram.com/z.e.r.o.12_x.43?stkn=MWEwcWprcDh0anlubQ==')}
              >
                <Text style={styles.socialButtonText}>📷 Instagram</Text>
              </TouchableOpacity>

              <Text style={styles.modalDescription}>
                شكراً لاستخدامك QR Rights ✨
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.aboutButton}
          onPress={() => setShowAbout(true)}
        >
          <Text style={styles.aboutButtonText}>👨‍💻</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>🛡️ QR Rights</Text>
        <Text style={styles.headerSubtitle}>حماية حقوق المحتوى الخاص بك</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'create' && styles.tabButtonActive]}
          onPress={() => setActiveTab('create')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'create' && styles.tabButtonTextActive]}>
            إنشاء
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'scan' && styles.tabButtonActive]}
          onPress={() => setActiveTab('scan')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'scan' && styles.tabButtonTextActive]}>
            مسح ضوئي
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'create' ? (
          <View style={styles.section}>
            {!displayProfile ? (
              <>
                {/* Creator Info Form */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>معلوماتك</Text>

                  <TextInput
                    style={styles.input}
                    placeholder="اسمك أو اسم علامتك التجارية"
                    value={creatorName}
                    onChangeText={setCreatorName}
                    placeholderTextColor="#999"
                  />

                  <TextInput
                    style={[styles.input, styles.bioInput]}
                    placeholder="وصف مختصر (اختياري)"
                    value={creatorBio}
                    onChangeText={setCreatorBio}
                    multiline={true}
                    numberOfLines={3}
                    placeholderTextColor="#999"
                  />
                </View>

                {/* Social Accounts */}
                {PLATFORMS.map(platform => (
                  <View key={platform.id} style={styles.platformCard}>
                    <Text style={styles.platformTitle}>
                      {platform.icon} {platform.name}
                    </Text>
                    <Text style={styles.platformSubtitle}>
                      أضف حتى 3 حسابات
                    </Text>

                    {[0, 1, 2].map((index) => (
                      <View key={`${platform.id}-${index}`}>
                        <View style={styles.accountInputWrapper}>
                          <TextInput
                            style={[
                              styles.socialInput,
                              errors[`${platform.id}-${index}`] && styles.inputError
                            ]}
                            placeholder={`الحساب ${index + 1}`}
                            value={socialAccounts[platform.id][index]}
                            onChangeText={(text) =>
                              updateSocialAccount(platform.id, index, text)
                            }
                            placeholderTextColor="#bbb"
                          />
                        </View>
                        {errors[`${platform.id}-${index}`] && (
                          <Text style={styles.errorText}>
                            ⚠️ {errors[`${platform.id}-${index}`]}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                ))}

                {/* Generate Button */}
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={validateAndGenerate}
                >
                  <Text style={styles.generateButtonText}>🔧 إنشاء ملفي</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Profile Display */}
                <View style={styles.profileCard}>
                  <Text style={styles.profileName}>{displayProfile.name}</Text>
                  {displayProfile.bio && (
                    <Text style={styles.profileBio}>{displayProfile.bio}</Text>
                  )}

                  {/* Social Links */}
                  {Object.keys(displayProfile.socials).map(platformId => {
                    const platform = PLATFORMS.find(p => p.id === platformId);
                    if (displayProfile.socials[platformId].length === 0) return null;

                    return (
                      <View key={platformId} style={styles.profileSection}>
                        <Text style={styles.profileSectionTitle}>
                          {platform.icon} {platform.name}
                        </Text>
                        {displayProfile.socials[platformId].map((url, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={styles.socialLink}
                            onPress={() => {
                              if (url.startsWith('http')) {
                                Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
                              } else {
                                Linking.openURL(`https://${url}`).catch(err => console.error('Error opening URL:', err));
                              }
                            }}
                          >
                            <Text style={styles.socialLinkText}>
                              {url.substring(0, 40)}...
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    );
                  })}

                  {/* JSON Display */}
                  <View style={styles.jsonBox}>
                    <Text style={styles.jsonLabel}>📋 البيانات (للمشاركة):</Text>
                    <Text style={styles.jsonContent} selectable={true}>
                      {generateJSON()}
                    </Text>
                  </View>

                  {/* Reset Button */}
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={handleReset}
                  >
                    <Text style={styles.resetButtonText}>← إنشاء ملف جديد</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>مسح QR Code</Text>
              <Text style={styles.cardDescription}>
                في الإصدار المقبل: سيتمكن التطبيق من مسح QR Codes من الكاميرا والصور
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 35,
    height: 35,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  developerCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  developerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  developerRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  socialButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalDescription: {
    marginTop: 15,
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  header: {
    backgroundColor: '#667eea',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  aboutButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutButtonText: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  tabButtonActive: {
    backgroundColor: '#667eea',
  },
  tabButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabButtonTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    textAlign: 'right',
  },
  bioInput: {
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  platformCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  platformTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  platformSubtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  accountInputWrapper: {
    marginBottom: 8,
  },
  socialInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    textAlign: 'right',
    marginBottom: 4,
  },
  inputError: {
    borderColor: '#ff6b6b',
    backgroundColor: '#ffe0e0',
  },
  errorText: {
    color: '#c62828',
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'right',
  },
  generateButton: {
    backgroundColor: '#667eea',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  profileBio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  profileSection: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 10,
  },
  socialLink: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  socialLinkText: {
    color: '#667eea',
    fontSize: 13,
    textAlign: 'right',
  },
  jsonBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  jsonLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  jsonContent: {
    fontSize: 11,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 6,
    textAlign: 'right',
  },
  resetButton: {
    backgroundColor: '#999',
    paddingVertical: 12,
    borderRadius: 10,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
