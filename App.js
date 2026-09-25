import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  Linking,
  PanResponder,
  Animated,
  Image,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg'; // ✅ تم التصحيح هنا

// صيغ صحيحة للروابط
const SOCIAL_PATTERNS = {
  facebook: /^(https?:\/\/)?(www\.)?facebook\.com\/[\w\-\.]+\/?(\?.*)?$/i,
  instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/[\w\.]+\/?(\?.*)?$/i,
  twitter: /^(https?:\/\/)?(www\.)?twitter\.com\/[\w]+\/?(\?.*)?$/i,
  tiktok: /^(https?:\/\/)?(www\.)?tiktok\.com\/@[\w\.]+\/?(\?.*)?$/i,
  youtube: /^(https?:\/\/)?(www\.|m\.)?youtube\.com\/(user|channel|c)\/[\w\-]+\/?(\?.*)?$/i,
  reddit: /^(https?:\/\/)?(www\.)?reddit\.com\/(u|user)\/[\w\-]+\/?(\?.*)?$/i,
  discord: /^(https?:\/\/)?(www\.)?discord\.gg\/[\w]+\/?(\?.*)?$/i,
};

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', icon: '📷', color: '#E1306C' },
  { id: 'twitter', name: 'Twitter', icon: '🐦', color: '#1DA1F2' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#FF0000' },
  { id: 'youtube', name: 'YouTube', icon: '📺', color: '#FF0000' },
  { id: 'reddit', name: 'Reddit', icon: '🔴', color: '#FF4500' },
  { id: 'discord', name: 'Discord', icon: '💬', color: '#5865F2' },
];

const validateURL = (url, platform) => {
  if (!url.trim()) return true;
  const pattern = SOCIAL_PATTERNS[platform];
  if (!pattern) return true;
  return pattern.test(url);
};

export default function App() {
  const [activeTab, setActiveTab] = useState('create');
  const [showAbout, setShowAbout] = useState(false);
  const [creatorName, setCreatorName] = useState('');
  const [creatorBio, setCreatorBio] = useState('');
  
  const [socialAccounts, setSocialAccounts] = useState(
    PLATFORMS.reduce((acc, platform) => {
      acc[platform.id] = ['', '', ''];
      return acc;
    }, {})
  );

  const [displayProfile, setDisplayProfile] = useState(null);
  const [errors, setErrors] = useState({});
  const [qrDataUrl, setQrDataUrl] = useState(null);

  // Pan responder for swipe to close modal
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (e, { dy }) => {
        if (dy > 100) {
          setShowAbout(false);
        }
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const updateSocialAccount = (platform, index, value) => {
    setSocialAccounts(prev => ({
      ...prev,
      [platform]: [
        ...prev[platform].slice(0, index),
        value,
        ...prev[platform].slice(index + 1)
      ]
    }));
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
      Alert.alert('تحذير', 'تحقق من الروابط المشار إليها بـ ⚠️');
      return;
    }

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
    setQrDataUrl(null);
  };

  return (
    <View style={styles.container}>
      {/* DARK MODE MODAL */}
      {showAbout && (
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAbout(false)}
        >
          <Animated.View
            style={[
              styles.modal,
              {
                transform: [{ translateY: pan.y }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.dragHandle} />
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAbout(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>👨‍ حول المطور</Text>
            
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
                onPress={() => Linking.openURL('https://www.instagram.com/z.e.r.o.12_x.43')}
              >
                <Text style={styles.socialButtonText}>📷 Instagram</Text>
              </TouchableOpacity>

              <Text style={styles.modalDescription}>
                شكراً لاستخدامك QR Rights ✨
              </Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* HEADER - DARK */}
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

      {/* TABS - DARK */}
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
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>معلوماتك</Text>

                  <TextInput
                    style={styles.input}
                    placeholder="اسمك أو اسم علامتك التجارية"
                    placeholderTextColor="#888"
                    value={creatorName}
                    onChangeText={setCreatorName}
                  />

                  <TextInput
                    style={[styles.input, styles.bioInput]}
                    placeholder="وصف مختصر (اختياري)"
                    placeholderTextColor="#888"
                    value={creatorBio}
                    onChangeText={setCreatorBio}
                    multiline={true}
                    numberOfLines={3}
                  />
                </View>

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
                        <TextInput
                          style={[
                            styles.socialInput,
                            errors[`${platform.id}-${index}`] && styles.inputError
                          ]}
                          placeholder={`الحساب ${index + 1}`}
                          placeholderTextColor="#888"
                          value={socialAccounts[platform.id][index]}
                          onChangeText={(text) =>
                            updateSocialAccount(platform.id, index, text)
                          }
                        />
                        {errors[`${platform.id}-${index}`] && (
                          <Text style={styles.errorText}>
                            ⚠️ {errors[`${platform.id}-${index}`]}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={validateAndGenerate}
                >
                  <Text style={styles.generateButtonText}>🔧 إنشاء ملفي و QR</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.profileCard}>
                  <Text style={styles.profileName}>{displayProfile.name}</Text>
                  {displayProfile.bio && (
                    <Text style={styles.profileBio}>{displayProfile.bio}</Text>
                  )}

                  {/* QR CODE SECTION */}
                  <View style={styles.qrContainer}>
                    <Text style={styles.qrLabel}>📱 رمز QR الخاص بك</Text>
                    <View style={styles.qrBox}>
                      <QRCode
                        value={generateJSON()}
                        size={200}
                        color="#667eea"
                        backgroundColor="#ffffff"
                        quietZone={10}
                      />
                    </View>
                  </View>

                  {/* SOCIAL LINKS */}
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
                                Linking.openURL(url).catch(err => console.error('Error:', err));
                              } else {
                                Linking.openURL(`https://${url}`).catch(err => console.error('Error:', err));
                              }
                            }}
                          >
                            <Text style={styles.socialLinkText}>
                              🔗 {url.substring(0, 35)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    );
                  })}

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
              <Text style={styles.cardTitle}>🔍 مسح QR Code</Text>
              <Text style={styles.cardDescription}>
                اختر صورة من الهاتف تحتوي على QR Code
              </Text>
              
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => Alert.alert('قريباً', 'سيتم إضافة خاصية قراءة الصور قريباً')}
              >
                <Text style={styles.uploadButtonText}>📤 اختر صورة QR</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  
  // MODAL - DARK
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'flex-end', zIndex: 1000 },
  modal: { backgroundColor: '#16213e', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, paddingBottom: 40, maxHeight: '80%' },
  dragHandle: { width: 40, height: 4, backgroundColor: '#667eea', borderRadius: 2, alignSelf: 'center', marginBottom: 15 },
  closeButton: { position: 'absolute', top: 15, right: 15, width: 35, height: 35, borderRadius: 50, backgroundColor: '#0f3460', justifyContent: 'center', alignItems: 'center' },
  closeButtonText: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
  developerCard: { backgroundColor: '#0f3460', borderRadius: 15, padding: 20, alignItems: 'center' },
  developerName: { fontSize: 22, fontWeight: 'bold', color: '#667eea', marginBottom: 5 },
  developerRole: { fontSize: 14, color: '#aaa', marginBottom: 20, fontStyle: 'italic' },
  socialButton: { width: '100%', paddingVertical: 12, borderRadius: 10, marginBottom: 10, justifyContent: 'center', alignItems: 'center' },
  socialButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  modalDescription: { marginTop: 15, fontSize: 13, color: '#888', textAlign: 'center' },

  // HEADER - DARK
  header: { backgroundColor: '#0f3460', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, alignItems: 'center', position: 'relative' },
  aboutButton: { position: 'absolute', top: 10, right: 15, width: 40, height: 40, borderRadius: 50, backgroundColor: 'rgba(102, 126, 234, 0.2)', justifyContent: 'center', alignItems: 'center' },
  aboutButtonText: { fontSize: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#aaa' },

  // TABS - DARK
  tabs: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#16213e', borderBottomWidth: 1, borderBottomColor: '#0f3460' },
  tabButton: { flex: 1, paddingVertical: 10, paddingHorizontal: 15, marginHorizontal: 5, borderRadius: 20, backgroundColor: '#0f3460' },
  tabButtonActive: { backgroundColor: '#667eea' },
  tabButtonText: { textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#888' },
  tabButtonTextActive: { color: 'white' },

  // CONTENT - DARK
  content: { flex: 1, padding: 15 },
  section: { marginBottom: 20 },
  card: { backgroundColor: '#16213e', borderRadius: 15, padding: 20, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#667eea' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  cardDescription: { fontSize: 14, color: '#aaa', lineHeight: 22 },
  
  input: { borderWidth: 1, borderColor: '#0f3460', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 14, marginBottom: 12, backgroundColor: '#0f3460', color: '#fff' },
  bioInput: { textAlignVertical: 'top', paddingTop: 12 },

  platformCard: { backgroundColor: '#16213e', borderRadius: 15, padding: 20, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#667eea' },
  platformTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  platformSubtitle: { fontSize: 12, color: '#888', marginBottom: 12 },

  socialInput: { borderWidth: 1, borderColor: '#0f3460', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, fontSize: 14, backgroundColor: '#0f3460', color: '#fff', marginBottom: 8 },
  inputError: { borderColor: '#e74c3c', backgroundColor: '#2a0a0a' },
  errorText: { color: '#e74c3c', fontSize: 12, marginBottom: 8, textAlign: 'right' },

  generateButton: { 
    backgroundColor: '#667eea', // ✅ لون ثابت آمن
    paddingVertical: 15, 
    borderRadius: 12, 
    marginTop: 10, 
    marginBottom: 20, 
    shadowColor: '#667eea', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 8 
  },
  generateButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },

  uploadButton: { backgroundColor: '#0f3460', paddingVertical: 15, borderRadius: 12, marginTop: 15, borderWidth: 2, borderColor: '#667eea' },
  uploadButtonText: { color: '#667eea', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },

  profileCard: { backgroundColor: '#16213e', borderRadius: 15, padding: 20, marginBottom: 15 },
  profileName: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 10 },
  profileBio: { fontSize: 14, color: '#aaa', textAlign: 'center', marginBottom: 20, lineHeight: 22 },

  qrContainer: { backgroundColor: '#0f3460', borderRadius: 15, padding: 20, alignItems: 'center', marginBottom: 20 },
  qrLabel: { fontSize: 14, fontWeight: 'bold', color: '#667eea', marginBottom: 10 },
  qrBox: { backgroundColor: '#fff', borderRadius: 10, padding: 10 },

  profileSection: { marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#0f3460' },
  profileSectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#667eea', marginBottom: 10 },
  socialLink: { backgroundColor: '#0f3460', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#667eea' },
  socialLinkText: { color: '#667eea', fontSize: 13 },

  resetButton: { backgroundColor: '#e74c3c', paddingVertical: 12, borderRadius: 10 },
  resetButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
});
