import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { Theme } from '@/constants/theme';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react-native';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type?: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
  onAccept?: () => void;
  visible?: boolean;
  style?: object;
}

const typeConfig = {
  success: {
    color: Theme.colors.success,
    icon: CheckCircle,
    backgroundColor: Theme.colors.background.card,
    borderColor: Theme.colors.success + '40',
    iconBackground: Theme.colors.success + '20',
  },
  error: {
    color: Theme.colors.error,
    icon: AlertCircle,
    backgroundColor: Theme.colors.background.card,
    borderColor: Theme.colors.error + '40',
    iconBackground: Theme.colors.error + '20',
  },
  warning: {
    color: Theme.colors.warning,
    icon: AlertTriangle,
    backgroundColor: Theme.colors.background.card,
    borderColor: Theme.colors.warning + '40',
    iconBackground: Theme.colors.warning + '20',
  },
  info: {
    color: Theme.colors.blue,
    icon: Info,
    backgroundColor: Theme.colors.background.card,
    borderColor: Theme.colors.blue + '40',
    iconBackground: Theme.colors.blue + '20',
  },
};

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  onAccept,
  visible = true,
  style = {},
}) => {
  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.backdrop} />
        <View style={[
          styles.container, 
          { 
            backgroundColor: config.backgroundColor, 
            borderColor: config.borderColor 
          }, 
          style
        ]}>
          {/* Content Row */}
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <View style={[styles.iconBackground, { backgroundColor: config.iconBackground }]}>
                <IconComponent size={24} color={config.color} />
              </View>
            </View>
            <View style={styles.textContainer}>
              {title && <Text style={[styles.title, { color: config.color }]}>{title}</Text>}
              <Text style={styles.message}>{message}</Text>
            </View>
          </View>
          
          {/* Button Row */}
          <View style={styles.buttonContainer}>
            {onAccept && (
              <TouchableOpacity 
                style={[styles.okButton, { backgroundColor: config.color }]} 
                onPress={onAccept} 
                activeOpacity={0.8}
              >
                <Text style={styles.okButtonText}>تأكيد</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={onAccept ? styles.closeButton : [styles.okButton, { backgroundColor: config.color }]}
              onPress={onClose} 
              activeOpacity={0.8}
            >
              <Text style={onAccept ? styles.closeButtonText : styles.okButtonText}>{onAccept ? 'إلغاء' : 'حسناً'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.overlay,
    paddingHorizontal: Theme.spacing.lg,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    backgroundColor: Theme.colors.background.card,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    padding: Theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
    minWidth: 320,
    alignSelf: 'center',
    ...Theme.shadows.large,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.lg,
  },
  iconContainer: {
    marginLeft: Theme.spacing.md,
    marginTop: 2,
  },
  iconBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    paddingLeft: Theme.spacing.sm,
  },
  title: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.lg,
    marginBottom: Theme.spacing.sm,
    textAlign: 'right',
  },
  message: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    textAlign: 'right',
    lineHeight: 22,
  },
  closeButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.background.hover,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    minWidth: 120,
    height: 48,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  okButton: {
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    height: 48,
    ...Theme.shadows.small,
  },
  okButtonText: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.white,
  },
  closeButtonText: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
  },
}); 