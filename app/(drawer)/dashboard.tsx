import { useHeaderHeight } from '@react-navigation/elements';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart, PieChart } from "react-native-chart-kit";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const screenWidth = Dimensions.get("window").width;

// --- DATOS MOCK EN ESPAÑOL ---
const totalBalance = 13250;
const totalIncome = 45600;
const totalExpenses = 32350;

// Datos para gráfico de flujo mensual
const monthlyFlow = [5000, 6200, 7800, 6500, 9100, 8500, 9300];
const monthlyExpenses = [4500, 5200, 6000, 5800, 8300, 7500, 8200];
const labels = ['May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov'];

// Distribución de gastos por categoría
const expensesByCategory = [
  { name: 'Vivienda', amount: 8500, color: '#4F46E5', legendFontColor: '#64748B' },
  { name: 'Comida', amount: 5200, color: '#F97316', legendFontColor: '#64748B' },
  { name: 'Transporte', amount: 3800, color: '#10B981', legendFontColor: '#64748B' },
  { name: 'Ocio', amount: 2400, color: '#EC4899', legendFontColor: '#64748B' },
  { name: 'Otros', amount: 4100, color: '#8B5CF6', legendFontColor: '#64748B' },
];

// Estrategias de deuda activas
const debtStrategies = [
  { name: 'Tarjeta de Crédito A', total: 12500, paid: 4200, priority: 'Alta', color: '#EF4444' },
  { name: 'Préstamo Personal', total: 8200, paid: 2800, priority: 'Media', color: '#F97316' },
  { name: 'Tarjeta de Crédito B', total: 4000, paid: 1500, priority: 'Baja', color: '#FCD34D' },
];

// Próximos pagos
const upcomingPayments = [
  { name: 'Renta', amount: 1200, date: '15 Nov', category: 'Vivienda' },
  { name: 'Tarjeta de Crédito A', amount: 350, date: '18 Nov', category: 'Deuda' },
  { name: 'Internet', amount: 65, date: '20 Nov', category: 'Servicios' },
];

// Presupuestos
const budgets = [
  { category: 'Comida', spent: 420, limit: 600, color: '#F97316' },
  { category: 'Ocio', spent: 210, limit: 200, color: '#EC4899' },
  { category: 'Transporte', spent: 95, limit: 300, color: '#10B981' },
];

const formatCurrency = (value) => {
    return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 });
};

// --- COMPONENTES VISUALES ---

const BalanceCard = ({ balance, income, expenses }) => {
  const netFlow = income - expenses;
  const isPositive = netFlow >= 0;
  
  return (
    <View style={styles.balanceCard}>
      <Text style={styles.balanceCardLabel}>Balance Total</Text>
      <Text style={styles.balanceCardAmount}>
        {formatCurrency(balance)}
      </Text>
      
      <View style={styles.balanceCardRow}>
        <View>
          <Text style={styles.balanceCardSubLabel}>Ingresos</Text>
          <Text style={styles.balanceCardIncome}>{formatCurrency(income)}</Text>
        </View>
        <View>
          <Text style={styles.balanceCardSubLabel}>Gastos</Text>
          <Text style={styles.balanceCardExpenses}>{formatCurrency(expenses)}</Text>
        </View>
        <View>
          <Text style={styles.balanceCardSubLabel}>Neto</Text>
          <Text style={[styles.balanceCardNet, { color: isPositive ? '#10B981' : '#EF4444' }]}>
            {isPositive ? '+' : ''}{formatCurrency(netFlow)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const MonthlyFlowChart = ({ incomeData, expensesData, labels }) => {
    const chartData = {
        labels: labels,
        datasets: [ { data: expensesData }, { data: incomeData } ],
    };
    const chartConfig = {
        backgroundGradientFrom: "#FFF", backgroundGradientTo: "#FFF", decimalPlaces: 0,
        color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`, labelColor: () => '#64748B',
        propsForDots: { r: "0" },
    };
    return <LineChart data={chartData} width={screenWidth - 60} height={200} chartConfig={chartConfig} bezier withHorizontalLines={false} withVerticalLines={false} />;
};

const ExpensesByCategoryChart = ({ data }) => {
    const chartConfig = { color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` };
    return <PieChart data={data} width={screenWidth - 60} height={180} chartConfig={chartConfig} accessor="amount" backgroundColor="transparent" paddingLeft="15" absolute />;
};

const Section = ({ title, children }) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const TabSelector = ({ tabs, activeTab, onTabPress }) => (
  <View style={styles.tabContainer}>
    {tabs.map((tab) => (
      <TouchableOpacity key={tab} style={[styles.tabButton, activeTab === tab && styles.activeTabButton]} onPress={() => onTabPress(tab)}>
        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
          {tab}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const SectionCard = ({ title, subtitle, icon, color, onPress }) => (
    <TouchableOpacity style={styles.sectionCard} onPress={onPress}>
        <View style={[styles.sectionCardIcon, { backgroundColor: color + '20' }]}>
            <Icon name={icon} size={24} color={color} />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles.sectionCardTitle}>{title}</Text>
            <Text style={styles.sectionCardSubtitle}>{subtitle}</Text>
        </View>
        <Icon name="chevron-right" size={24} color="#94A3B8" />
    </TouchableOpacity>
);

// --- PANTALLA PRINCIPAL REESTRUCTURADA ---
export default function DashboardScreen() {
    const headerHeight = useHeaderHeight();
    const [activeReportTab, setActiveReportTab] = useState('Flow'); // Flow | Categories
    
    const overBudgetCount = budgets.filter(b => b.spent > b.limit).length;
    
    return (
        <ScrollView 
            contentContainerStyle={{ paddingTop: headerHeight + 20, paddingBottom: 30 }}
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <BalanceCard 
                balance={totalBalance} 
                income={totalIncome} 
                expenses={totalExpenses} 
            />
            
            <Section title="Upcoming Payments">
                {upcomingPayments.slice(0, 2).map((payment, index) => (
                    <View key={index} style={styles.paymentRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                           <View style={[styles.paymentDot, {backgroundColor: '#EF4444'}]}/>
                           <View>
                                <Text style={styles.paymentName}>{payment.name}</Text>
                                <Text style={styles.paymentDate}>{payment.date}</Text>
                           </View>
                        </View>
                        <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                    </View>
                ))}
                <TouchableOpacity style={styles.viewAllButton}>
                    <Text style={styles.viewAllText}>View All Payments</Text>
                </TouchableOpacity>
            </Section>

            <Section title="Financial Reports">
                <TabSelector 
                    tabs={['Flow', 'Categories']}
                    activeTab={activeReportTab}
                    onTabPress={setActiveReportTab}
                />
                <View style={{ marginTop: 20 }}>
                    {activeReportTab === 'Flow' && (
                        <MonthlyFlowChart 
                            incomeData={monthlyFlow}
                            expensesData={monthlyExpenses}
                            labels={labels}
                        />
                    )}
                    {activeReportTab === 'Categories' && (
                        <ExpensesByCategoryChart data={expensesByCategory} />
                    )}
                </View>
            </Section>

            <Section title="Manage">
                <SectionCard 
                    title="Budgets"
                    subtitle={`${overBudgetCount} presupuesto(s) excedido(s)`}
                    icon="wallet"
                    color="#10B981"
                    onPress={() => { /* Navegar a la pantalla de Presupuestos */ }}
                />
                 <SectionCard 
                    title="Debt Strategies"
                    subtitle={`${debtStrategies.length} planes activos`}
                    icon="chart-gantt"
                    color="#4F46E5"
                    onPress={() => { /* Navegar a la pantalla de Deudas */ }}
                />
            </Section>
            
            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    balanceCard: {
      backgroundColor: '#4F46E5', borderRadius: 20, padding: 24, marginHorizontal: 10,
    },
    balanceCardLabel: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 },
    balanceCardAmount: { color: '#FFF', fontSize: 42, fontWeight: 'bold', marginTop: 8 },
    balanceCardRow: { flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' },
    balanceCardSubLabel: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 12 },
    balanceCardIncome: { color: '#10B981', fontSize: 18, fontWeight: '600', marginTop: 4 },
    balanceCardExpenses: { color: '#F97316', fontSize: 18, fontWeight: '600', marginTop: 4 },
    balanceCardNet: { fontSize: 18, fontWeight: '600', marginTop: 4 },
    sectionContainer: {
        marginHorizontal: 10,
        marginTop: 25,
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 16,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
        padding: 4,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 12,
    },
    activeTabButton: {
      backgroundColor: '#FFF',
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 5
    },
    tabText: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    activeTabText: {
        color: '#4F46E5',
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    paymentDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 12,
    },
    paymentName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
    },
    paymentDate: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    paymentAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    viewAllButton: {
        marginTop: 12,
        alignItems: 'center',
    },
    viewAllText: {
        color: '#4F46E5',
        fontSize: 14,
        fontWeight: '600',
    },
    sectionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    sectionCardIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    sectionCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    sectionCardSubtitle: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
    },
});