import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, 
  Alert, Linking, Image, Modal, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons'; // مكتبة الأيقونات الاحترافية
import QRCode from 'react-native-qrcode-svg';

// --- إعدادات المنصات والألوان ---
const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: 'logo-facebook', color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', icon: 'logo-instagram', color: '#E1306C' },
  { id: 'twitter', name: 'Twitter/X', icon: 'logo-twitter', color: '#1DA1F2' },
  { id: 'tiktok', name: 'TikTok', icon: 'logo-tiktok', color: '#000000' },
  { id: 'youtube', name: 'YouTube', icon: 'logo-youtube', color: '#FF0000' },
  { id: 'reddit', name: 'Reddit', icon: 'logo-reddit', color: '#FF4500' },
  { id: 'discord', name: 'Discord', icon: 'logo-discord', color: '#5865F2' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('create');
  const [showAbout, setShowAbout] = useState(false);
  
  // بيانات المستخدم
  const [creatorName, setCreatorName] = useState('');
  const [bgImage, setBgImage] = useState(null); // صورة الخلفية
  
  // نظام الحسابات الديناميكي
  // الشكل: { facebook: ['url1', 'url2'], instagram: ['url1'] }
  const [accounts, setAccounts] = useState({}); 

  // حالة العرض النهائية
  const [generatedProfile, setGeneratedProfile] = useState(null);

  // دالة إضافة حساب جديد لمنصة معينة
  const addAccount = (platformId) => {
    setAccounts(prev => ({
      ...prev,
      [platformId]: [...(prev[platformId] || []), ''] // أضف خانة فارغة جديدة
    }));
  };

  // دالة تحديث قيمة حساب محدد
  const updateAccount = (platformId, index, value) => {
    const newAccounts = [...(accounts[platformId] || [])];
    newAccounts[index] = value;
    setAccounts(prev => ({ ...prev, [platformId]: newAccounts }));
  };

  // دالة حذف حساب
  const removeAccount = (platformId, index) => {
    const newAccounts = [...(accounts[platformId] || [])];
    newAccounts.splice(index, 1);
    setAccounts(prev => ({ ...prev, [platformId]: newAccounts.filter(Boolean) }));
  };

  // اختيار صورة خلفية
  const pickBackground = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setBgImage(result.assets[0].uri);
    }
  };

  // توليد الملف والعرض
  const generateProfile = () => {
    if (!creatorName.trim()) {
      Alert.alert('خطأ', 'الرجاء إدخال اسمك أولاَ');
      return;
    }

    // تنظيف البيانات (حذف الحقول الفارغة)
    const cleanAccounts = {};
    Object.keys(accounts).forEach(key => {
      const validUrls = accounts[key].filter(url => url.trim() !== '');
      if (validUrls.length > 0) {
        cleanAccounts[key] = validUrls;
      }
    });

    const profileData = {
      name: creatorName,
      socials: cleanAccounts,
      bg: bgImage ? 'uploaded_image' : null, // نعلم بوجود صورة فقط لتقليل حجم JSON
      timestamp: new Date().toISOString(),
    };

    setGeneratedProfile(profileData);
  };

  // إنشاء نص الـ QR (JSON مضغوط)
  const getQRValue = () => {
    if (!generatedProfile) return '';
    // نحذف الصورة من الـ JSON لأنها قد تكون كبيرة جداَ ولا تصلح للنص
    const dataForQR = { ...generatedProfile, bg: undefined };
    return JSON.stringify(dataForQR);
  };

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowAbout(true)} style={styles.avatarBtn}>
           <Text style={{fontSize: 24}}>👨‍💻</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🛡️ QR Rights Pro</Text>
        <Text style={styles.subtitle}>احمية هويتك الرقمية باحترافية</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'create' && styles.activeTab]}
          onPress={() => setActiveTab('create')}
        >
          <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>إنشاء ملف</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'scan' && styles.activeTab]}
          onPress={() => setActiveTab('scan')}
        >
          <Text style={[styles.tabText, activeTab === 'scan' && styles.activeTabText]}>مسح رمز</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {activeTab === 'create' ? (
          !generatedProfile ? (
            /* --- صفحة الإدخال --- */
            <View style={styles.formSection}>
              
              {/* معلومات أساسية */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>المعلومات الأساسية</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="اسم المستخدم / العلامة التجارية"
                  placeholderTextColor="#888"
                  value={creatorName}
                  onChangeText={setCreatorName}
                />

                {/* رفع صورة خلفية (اختياري للعرض المحلي) */}
                <TouchableOpacity style={styles.imageUploadBtn} onPress={pickBackground}>
                  {bgImage ? (
                    <Image source={{uri: bgImage}} style={styles.previewImg} resizeMode="cover"/>
                  ) : (
                    <>
                      <Ionicons name="image-outline" size={24} color="#aaa" />
                      <Text style={styles.uploadText}>رفع صورة خلفية (اختياري)</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* قائمة المنصات */}
              {PLATFORMS.map(platform => (
                <View key={platform.id} style={styles.platformCard}>
                  <View style={styles.platformHeader}>
                    <Ionicons name={platform.icon} size={20} color={platform.color} />
                    <Text style={styles.platformName}>{platform.name}</Text>
                    <TouchableOpacity onPress={() => addAccount(platform.id)} style={styles.addBtnSmall}>
                       <Ionicons name="add-circle" size={24} color="#667eea" />
                    </TouchableOpacity>
                  </View>

                  {/* عرض الحسابات المضافة لهذا المنصة */}
                  {(accounts[platform.id] || []).map((url, index) => (
                    <View key={index} style={styles.accountRow}>
                      <TextInput
                        style={styles.smallInput}
                        placeholder={`رابط الحساب ${index + 1}`}
                        placeholderTextColor="#666"
                        value={url}
                        onChangeText={(text) => updateAccount(platform.id, index, text)}
                      />
                      <TouchableOpacity onPress={() => removeAccount(platform.id, index)}>
                         <Ionicons name="trash-bin-outline" size={20} color="#ff4757" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  {(!accounts[platform.id] || accounts[platform.id].length === 0) && (
                     <Text style={styles.emptyHint}>لا توجد حسابات مضافة بعد.</Text>
                  )}
                </View>
              ))}

              <TouchableOpacity style={styles.generateBigBtn} onPress={generateProfile}>
                <Text style={styles.generateBigBtnText}>✨ توليد البطاقة الذكية</Text>
              </TouchableOpacity>

            </View>
          ) : (
            /* --- صفحة العرض (البطاقة النهائية) --- */
            <View style={styles.displaySection}>
              
              {/* تصميم البطاقة الشبيه بالإنستاغرام */}
              <View style={styles.smartCard}>
                {/* خلفية الصورة إذا وجدت */}
                {bgImage && (
                   <Image source={{uri: bgImage}} style={styles.cardBgImage} resizeMode="cover" />
                )}
                
                <View style={styles.cardOverlay}>
                  <Text style={styles.displayName}>{generatedProfile.name}</Text>
                  
                  {/* منطقة الـ QR الاحترافية */}
                  <View style={styles.qrWrapper}>
                     <View style={styles.qrInnerBox}>
                        {/* هنا نضع اللوجو في المنتصف */}
                        <QRCode
                          value={getQRValue()}
                          size={180}
                          bgColor="transparent"
                          fgColor="#ffffff"
                          logo={{ uri: require('./assets/adaptive-icon.png') }} // يستخدم أيقونة التطبيق كلوجو
                          logoSize={40}
                          logoBackgroundColor='transparent'
                        />
                     </View>
                     
                     {/* اسم المستخدم تحت الرمز */}
                     <View style={styles.usernameTag}>
                        <Text style={styles.usernameText}>@{generatedProfile.name.replace(/\s/g, '')}</Text>
                     </View>
                  </View>

                  {/* روابط التواصل المختصرة */}
                  <View style={styles.linksList}>
                    {Object.entries(generatedProfile.socials).map(([platId, urls]) => {
                       const platInfo = PLATFORMS.find(p => p.id === platId);
                       return (
                         <View key={platId} style={styles.linkItem}>
                            <Ionicons name={platInfo?.icon} size={16} color={platInfo?.color} />
                            <Text style={styles.linkCount}>{urls.length} {platInfo?.name}</Text>
                         </View>
                       );
                    })}
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('تم!', 'يمكنك أخذ لقطة شاشة للرمز الآن.')}>
                 <Text style={styles.actionBtnText}>📸 حفظ كصورة</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.backBtn} onPress={() => setGeneratedProfile(null)}>
                 <Text style={styles.backBtnText}>← تعديل البيانات</Text>
              </TouchableOpacity>

            </View>
          )
        ) : (
          /* --- تبويب المسح (Placeholder) --- */
          <View style={styles.scanPlaceholder}>
             <Ionicons name="qr-code-outline" size={60} color="#555" />
             <Text style={styles.scanText}>ميزة المسح الضوئي قيد التطوير...</Text>
             <Text style={styles.subScanText}>ستتمكن قريباَ من مسح رموز الآخرين وعرض ملفاتهم.</Text>
          </View>
        )}
      </ScrollView>

      {/* نافذة حول المطور */}
      <Modal visible={showAbout} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>👨‍💻 حول المطور</Text>
            
            <TouchableOpacity 
              style={[styles.devLinkBtn, {backgroundColor: '#1877F2'}]}
              onPress={() => Linking.openURL('https://www.facebook.com/Alexei2986')}
            >
               <Ionicons name="logo-facebook" size={20} color="white" />
               <Text style={styles.devLinkText}>Facebook - Alexei</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.devLinkBtn, {backgroundColor: '#E1306C'}]}
              onPress={() => Linking.openURL('https://www.instagram.com/z.e.r.o.12_x.43')}
            >
               <Ionicons name="logo-instagram" size={20} color="white" />
               <Text style={styles.devLinkText}>Instagram - z.e.r.o.12_x.43</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowAbout(false)}>
               <Text style={styles.closeModalText}>إغلاق ✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' }, // أزرق داكن جداً
  header: { padding: 20, alignItems: 'center', backgroundColor: '#1e293b', borderBottomWidth: 1, borderColor: '#334155' },
  avatarBtn: { position: 'absolute', left: 20, top: 20, padding: 5 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 12, color: '#94a3b8', marginTop: 5 },
  
  tabsContainer: { flexDirection: 'row', padding: 10, gap: 10 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#1e293b', alignItems: 'center' },
  activeTab: { backgroundColor: '#6366f1' },
  tabText: { color: '#94a3b8', fontWeight: '600' },
  activeTabText: { color: '#fff' },

  scrollContent: { padding: 15, paddingBottom: 50 },
  
  // Forms
  card: { backgroundColor: '#1e293b', borderRadius: 15, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  input: { backgroundColor: '#0f172a', borderRadius: 8, padding: 12, color: '#fff', borderWidth: 1, borderColor: '#334155', marginBottom: 10 },
  
  imageUploadBtn: { height: 80, borderRadius: 10, borderWidth: 1, borderColor: '#475569', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  previewImg: { width: '100%', height: '100%', borderRadius: 10 },
  uploadText: { color: '#94a3b8', fontSize: 12, marginTop: 5 },

  platformCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  platformHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  platformName: { color: '#fff', fontWeight: 'bold', marginLeft: 10, flex: 1 },
  addBtnSmall: { padding: 2 },
  
  accountRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  smallInput: { flex: 1, backgroundColor: '#0f172a', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, color: '#fff', borderWidth: 1, borderColor: '#334155', fontSize: 13 },
  emptyHint: { color: '#64748b', fontSize: 11, fontStyle: 'italic', textAlign: 'center', marginVertical: 5 },

  generateBigBtn: { backgroundColor: '#6366f1', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#6366f1', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  generateBigBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Display Card (The Fancy Part)
  displaySection: { alignItems: 'center' },
  smartCard: { 
    width: '100%', 
    height: 450, 
    borderRadius: 20, 
    overflow: 'hidden', 
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#6366f1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10
  },
  cardBgImage: { position: 'absolute', width: '100%', height: '100%', opacity: 0.3 },
  cardOverlay: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  displayName: { color: '#fff', fontSize: 28, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4, marginBottom: 20 },
  
  qrWrapper: { alignItems: 'center', marginBottom: 20 },
  qrInnerBox: { 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    padding: 15, 
    borderRadius: 15, 
  },
  usernameTag: { 
    backgroundColor: '#6366f1', 
    paddingHorizontal: 15, 
    paddingVertical: 5, 
    borderRadius: 20, 
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#fff'
  },
  usernameText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  linksList: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  linkItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#334155', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  linkCount: { color: '#cbd5e1', fontSize: 12, marginLeft: 5 },

  actionBtn: { backgroundColor: '#10b981', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, marginTop: 20, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontWeight: 'bold' },
  backBtn: { marginTop: 15 },
  backBtnText: { color: '#94a3b8', textDecorationLine: 'underline' },

  // Scan Placeholder
  scanPlaceholder: { alignItems: 'center', justifyContent: 'center', height: 400 },
  scanText: { color: '#fff', fontSize: 18, marginTop: 10, fontWeight: 'bold' },
  subScanText: { color: '#94a3b8', textAlign: 'center', marginTop: 5 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1e293b', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, minHeight: 300 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  devLinkBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 12, marginBottom: 12, gap: 10 },
  devLinkText: { color: '#fff', fontWeight: 'bold' },
  closeModalBtn: { marginTop: 20, alignItems: 'center', padding: 10 },
  closeModalText: { color: '#ef4444', fontWeight: 'bold' },
});
