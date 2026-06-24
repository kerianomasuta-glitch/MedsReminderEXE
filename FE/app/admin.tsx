import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FeedbackToast } from '@/components/meds/feedback-toast';
import { ActionButton, AppScreen, PageHeader, SectionCard, TextField } from '@/components/meds/ui-kit';
import { adminSummaryMock, adminUsersMock } from '@/constants/app-mock';
import { MedsTheme } from '@/constants/meds-theme';

export default function AdminScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [users, setUsers] = useState(adminUsersMock);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleAdminLogin = () => {
    if (!email.trim() || !password.trim()) {
      setActionMessage('Vui lòng nhập đầy đủ email và mật khẩu admin.');
      return;
    }
    setAdminLoggedIn(true);
    setActionMessage('Đăng nhập admin thành công (mock).');
  };

  const toggleUserLock = (id: string) => {
    setUsers((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'Active' ? 'Locked' : 'Active',
            }
          : item,
      ),
    );
    setActionMessage('Đã cập nhật trạng thái tài khoản.');
  };

  return (
    <AppScreen>
      <PageHeader title="Admin Dashboard" subtitle="Quản trị người dùng và trạng thái hệ thống ở mức tổng quan." />

      <SectionCard>
        <TextField label="Admin email" value={email} onChangeText={setEmail} placeholder="admin@medsreminder.app" />
        <TextField label="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
        <ActionButton label="Đăng nhập admin" onPress={handleAdminLogin} />
        {adminLoggedIn ? <Text style={styles.loggedBadge}>Trạng thái: Đang đăng nhập</Text> : null}
      </SectionCard>

      <SectionCard>
        <View style={styles.statsRow}>
          <SummaryCard label="Tổng user" value={adminSummaryMock.totalUsers} />
          <SummaryCard label="Lịch hoạt động" value={adminSummaryMock.activeSchedules} />
          <SummaryCard label="Cảnh báo hôm nay" value={adminSummaryMock.todayAlerts} />
          <SummaryCard label="Tài khoản cần hỗ trợ" value={adminSummaryMock.supportNeededAccounts} />
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.tableTitle}>User Management</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            <View style={[styles.row, styles.headerRow]}>
              <HeaderCell text="Tên user" width={160} />
              <HeaderCell text="Email/SĐT" width={170} />
              <HeaderCell text="Vai trò" width={90} />
              <HeaderCell text="Trạng thái" width={110} />
              <HeaderCell text="Ngày tạo" width={100} />
              <HeaderCell text="Action" width={130} />
            </View>

            {users.map((item) => (
              <View key={item.id} style={styles.row}>
                <Cell text={item.name} width={160} />
                <Cell text={item.contact} width={170} />
                <Cell text={item.role} width={90} />
                <Cell text={item.status} width={110} />
                <Cell text={item.createdAt} width={100} />
                <View style={[styles.cell, { width: 130 }]}>
                  <Pressable
                    style={styles.smallBtn}
                    onPress={() => setActionMessage(`Chi tiết user: ${item.name} (${item.role})`)}>
                    <Text style={styles.smallBtnText}>Chi tiết</Text>
                  </Pressable>
                  <Pressable style={[styles.smallBtn, styles.smallBtnDanger]} onPress={() => toggleUserLock(item.id)}>
                    <Text style={[styles.smallBtnText, styles.smallBtnDangerText]}>Khóa/Mở</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SectionCard>
      <FeedbackToast
        message={actionMessage}
        tone={actionMessage?.includes('Vui lòng') ? 'warning' : 'info'}
        onHide={() => setActionMessage(null)}
      />
    </AppScreen>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function HeaderCell({ text, width }: { text: string; width: number }) {
  return (
    <View style={[styles.cell, { width }]}>
      <Text style={styles.headerText}>{text}</Text>
    </View>
  );
}

function Cell({ text, width }: { text: string; width: number }) {
  return (
    <View style={[styles.cell, { width }]}>
      <Text style={styles.cellText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryCard: {
    width: '48.5%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    backgroundColor: '#F8FBFF',
    paddingVertical: 12,
    alignItems: 'center',
  },
  summaryValue: {
    color: MedsTheme.colors.primaryDark,
    fontSize: 22,
    fontWeight: '800',
  },
  summaryLabel: {
    color: MedsTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  tableTitle: {
    color: MedsTheme.colors.textMain,
    fontSize: 19,
    fontWeight: '800',
  },
  table: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5ECF7',
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    backgroundColor: '#ECF4FF',
  },
  cell: {
    minHeight: 48,
    borderRightWidth: 1,
    borderRightColor: '#E5ECF7',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  headerText: {
    color: MedsTheme.colors.primaryDark,
    fontWeight: '700',
    fontSize: 12,
  },
  cellText: {
    color: MedsTheme.colors.textMain,
    fontSize: 12,
  },
  smallBtn: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MedsTheme.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  smallBtnText: {
    color: MedsTheme.colors.textMain,
    fontSize: 11,
    fontWeight: '700',
  },
  smallBtnDanger: {
    backgroundColor: '#FFF0F1',
    borderColor: '#F6CBCD',
  },
  smallBtnDangerText: {
    color: '#B63B49',
  },
  loggedBadge: {
    textAlign: 'center',
    color: '#126E48',
    fontWeight: '700',
  },
});
