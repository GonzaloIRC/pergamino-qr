import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Divider, Button, Chip } from 'react-native-paper';
import { generateActivitySummary, getScanStats } from '../services/trackingService';

/**
 * Componente para visualizar estadísticas del sistema de tracking
 */
export default function TrackingDashboard() {
  const [loading, setLoading] = useState(true);
  const [activitySummary, setActivitySummary] = useState(null);
  const [scanStats, setScanStats] = useState(null);
  const [period, setPeriod] = useState('day'); // 'day', 'week', 'month'
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await generateActivitySummary({ period });
      setActivitySummary(summary);

      // Obtener estadísticas por tipo
      const stats = await getScanStats({ period });
      setScanStats(stats);
    } catch (err) {
      console.error('Error cargando datos de tracking:', err);
      setError('Error cargando datos. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={loadData} style={styles.retryButton}>
          Reintentar
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.periodCard}>
        <Card.Content>
          <Title>Período</Title>
          <View style={styles.periodSelector}>
            <TouchableOpacity
              style={[styles.periodButton, period === 'day' && styles.activePeriod]}
              onPress={() => setPeriod('day')}
            >
              <Text style={[styles.periodButtonText, period === 'day' && styles.activePeriodText]}>
                Hoy
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.periodButton, period === 'week' && styles.activePeriod]}
              onPress={() => setPeriod('week')}
            >
              <Text style={[styles.periodButtonText, period === 'week' && styles.activePeriodText]}>
                Semana
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.periodButton, period === 'month' && styles.activePeriod]}
              onPress={() => setPeriod('month')}
            >
              <Text style={[styles.periodButtonText, period === 'month' && styles.activePeriodText]}>
                Mes
              </Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {activitySummary && (
        <>
          <Card style={styles.card}>
            <Card.Content>
              <Title>Resumen de Actividad</Title>
              <Paragraph>
                {formatDate(activitySummary.startDate)} - {formatDate(activitySummary.endDate)}
              </Paragraph>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{activitySummary.totalScans}</Text>
                  <Text style={styles.statLabel}>Escaneos</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{activitySummary.userCount}</Text>
                  <Text style={styles.statLabel}>Usuarios</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title>Distribución por Tipo</Title>
              {activitySummary.byType && Object.entries(activitySummary.byType).map(([type, count]) => (
                <View key={`type-${type}`} style={styles.distributionItem}>
                  <Text style={styles.distributionLabel}>{type}</Text>
                  <Text style={styles.distributionValue}>{count}</Text>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${(count / activitySummary.totalScans) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title>Distribución por Acción</Title>
              <View style={styles.chipContainer}>
                {activitySummary.byAction && Object.entries(activitySummary.byAction).map(([action, count]) => (
                  <Chip 
                    key={`action-${action}`} 
                    style={styles.chip}
                    onPress={() => {}}
                  >
                    {action}: {count}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Title>Distribución por Dispositivo</Title>
              <View style={styles.chipContainer}>
                {activitySummary.byDevice && Object.entries(activitySummary.byDevice).map(([device, count]) => (
                  <Chip 
                    key={`device-${device}`} 
                    style={styles.chip}
                    onPress={() => {}}
                  >
                    {device}: {count}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        </>
      )}

      <Button 
        mode="contained" 
        onPress={loadData} 
        style={styles.refreshButton}
      >
        Actualizar Datos
      </Button>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Sistema de Tracking - v1.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  periodCard: {
    marginBottom: 16,
    backgroundColor: '#f0f9ff',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  periodButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: '#e0e0e0',
  },
  activePeriod: {
    backgroundColor: '#0066CC',
  },
  periodButtonText: {
    fontWeight: 'bold',
  },
  activePeriodText: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  distributionLabel: {
    flex: 1,
    fontSize: 14,
  },
  distributionValue: {
    width: 30,
    textAlign: 'right',
    marginRight: 10,
  },
  progressBar: {
    flex: 2,
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0066CC',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  chip: {
    margin: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginBottom: 20,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 10,
  },
  refreshButton: {
    marginVertical: 16,
    backgroundColor: '#0066CC',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    color: '#999',
    fontSize: 12,
  },
});
