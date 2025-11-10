import { useHeaderHeight } from '@react-navigation/elements';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from "react-native-chart-kit";
import * as Progress from 'react-native-progress';
import { Circle, G, Line } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const screenWidth = Dimensions.get("window").width;

// --- DATOS FALSOS (MOCK DATA) ---
const incomeData = [5000, 6200, 7800, 6500, 9100, 8500, 9300];
const expensesData = [4500, 5200, 6000, 5800, 8300, 7500, 8200];
const labels = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
const totalBalance = 13250;
const creditLimit = 53000;
const creditUsed = 39750;

const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
};

// --- COMPONENTES ---

// Componente para el gráfico con react-native-chart-kit
const FinanceChart = ({ incomeData, expensesData, labels, activeDataType }) => {
    // --- INICIO DE LA CORRECCIÓN #1: ESTADO PARA EL PUNTO SELECCIONADO ---
    // Guardará { index, value, x, y } del punto que el usuario toque.
    const [selectedPoint, setSelectedPoint] = useState(null);

    const chartData = {
        labels: labels,
        datasets: [
            {
                data: expensesData,
                color: (opacity = 1) => `#F97316`,
                strokeWidth: 2.5
            },
            {
                data: activeDataType === 'income' ? incomeData : expensesData,
                color: (opacity = 1) => `#4F46E5`,
                strokeWidth: 3
            },
        ],
    };

    const chartConfig = {
        backgroundGradientFrom: "#F8FAFC",
        backgroundGradientTo: "#F8FAFC",
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        // Hacemos los puntos por defecto más grandes para que sean más fáciles de tocar
        propsForDots: {
            r: "5",
            strokeWidth: "2",
            stroke: "#F8FAFC", // Un borde para que se vean sobre la línea
        }
    };


    return (
        <View className=' mt-5'>
            <LineChart
                data={chartData}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
                bezier
                withVerticalLines={false}
                withHorizontalLines={false}
                withInnerLines={false}
                withOuterLines={false}
                withShadow={false}
                
                // --- INICIO DE LA CORRECCIÓN #2: ACTUALIZAR ESTADO AL HACER CLIC ---
                onDataPointClick={(data) => {
                    // data contiene { index, value, x, y }
                    setSelectedPoint(data);
                }}

                // --- INICIO DE LA CORRECCIÓN #3: DECORADOR QUE USA EL ESTADO ---
                decorator={() => {
                    // Si no hay ningún punto seleccionado, no dibujes nada.
                    if (!selectedPoint) {
                        return null;
                    }
                    return (
                        <G>
                            {/* Usamos las coordenadas 'x' y 'y' del estado */}
                            <Line
                                x1={selectedPoint.x}
                                y1={selectedPoint.y}
                                x2={selectedPoint.x}
                                y2={190} // Altura fija hasta la base del gráfico
                                stroke="#4F46E5"
                                strokeWidth="1"
                                strokeDasharray="4, 4"
                            />
                            <Circle
                                cx={selectedPoint.x}
                                cy={selectedPoint.y}
                                r="6"
                                fill="#FFFFFF"
                                stroke="#4F46E5"
                                strokeWidth="2"
                            />
                        </G>
                    );
                }}
                formatXLabel={(label) => label}
            />
        </View>
    );
};


// Componente para la tarjeta de límite de crédito (sin cambios)
const CreditLimitCard = ({ used, limit }) => {
    const percentage = used / limit;
    return (
        <TouchableOpacity style={cardStyles.container}>
            <View style={cardStyles.progressContainer}>
                 <Progress.Circle 
                    size={60} 
                    progress={percentage} 
                    color="#FFF" 
                    unfilledColor="rgba(255, 255, 255, 0.3)"
                    borderWidth={0}
                    thickness={6}
                />
                <Text style={cardStyles.progressText}>{`${Math.round(percentage * 100)}%`}</Text>
            </View>
            <View style={cardStyles.textContainer}>
                <Text style={cardStyles.title}>Your credit limit</Text>
                <Text style={cardStyles.amount}>
                    {`${formatCurrency(used)} of ${formatCurrency(limit)}`}
                </Text>
            </View>
            <View style={cardStyles.iconContainer}>
                 <Icon name="chevron-right" size={24} color="#FFF" />
            </View>
        </TouchableOpacity>
    );
};

// --- PANTALLA PRINCIPAL ---
export default function HomeScreen() {
    const headerHeight = useHeaderHeight();
    const [activeTab, setActiveTab] = useState('income');
    const [activePeriod, setActivePeriod] = useState('month');
    const periods = ['Day', 'Week', 'Month', 'Year'];

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.content}>
                {/* Total Balance */}
                <View style={styles.balanceContainer}>
                    <Text style={styles.balanceLabel}>Total balance</Text>
                    <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
                </View>

                {/* Income/Expenses Toggle */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity 
                        style={[styles.toggleButton, activeTab === 'income' && styles.activeToggleButton]}
                        onPress={() => setActiveTab('income')}
                    >
                        <Text style={[styles.toggleText, activeTab === 'income' && styles.activeToggleText]}>Income</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.toggleButton, activeTab === 'expenses' && styles.activeToggleButton]}
                        onPress={() => setActiveTab('expenses')}
                    >
                        <Text style={[styles.toggleText, activeTab === 'expenses' && styles.activeToggleText]}>Expenses</Text>
                    </TouchableOpacity>
                </View>
                
                 {/* Period Filter */}
                <View style={styles.periodContainer}>
                    {periods.map(period => (
                         <TouchableOpacity key={period} onPress={() => setActivePeriod(period.toLowerCase())}>
                            <Text style={[
                                styles.periodText, 
                                activePeriod === period.toLowerCase() && styles.activePeriodText
                            ]}>
                                {period}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Gráfico */}
                <FinanceChart 
                    incomeData={incomeData} 
                    expensesData={expensesData} 
                    labels={labels}
                    activeDataType={activeTab}
                />

                {/* Tarjeta de Límite de Crédito */}
                <CreditLimitCard used={creditUsed} limit={creditLimit}/>
            </View>
        </ScrollView>
    );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    content: {
        paddingHorizontal: 10,
    },
    balanceContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    balanceLabel: {
        fontSize: 16,
        color: '#64748B',
    },
    balanceAmount: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#1E293B',
        marginTop: 5,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#E2E8F0',
        borderRadius: 20,
        padding: 4,
        alignSelf: 'center',
    },
    toggleButton: {
        paddingVertical: 8,
        paddingHorizontal: 25,
        borderRadius: 16,
    },
    activeToggleButton: {
        backgroundColor: '#4F46E5',
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    activeToggleText: {
        color: '#FFF',
    },
    periodContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 30,
    },
    periodText: {
        fontSize: 16,
        color: '#94A3B8',
        fontWeight: '500',
    },
    activePeriodText: {
        color: '#F97316',
        fontWeight: 'bold',
    },
});

const chartStyles = StyleSheet.create({
    
});

const cardStyles = StyleSheet.create({
    container: {
        backgroundColor: '#4F46E5',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 40,
        marginHorizontal: 10,
    },
    progressContainer: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressText: {
        position: 'absolute',
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    textContainer: {
        flex: 1,
        marginLeft: 15,
    },
    title: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
    },
    amount: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
    },
    iconContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
});