import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Share, Alert, TouchableOpacity } from 'react-native';
import { Button, Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { getUserReferrals, generateReferralCode } from '../services/referrals';

export default function ReferralsScreen() {
  const { user } = useContext(AuthContext);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    if (!user) return;

    const loadReferrals = async () => {
      try {
        setLoading(true);
        const userReferrals = await getUserReferrals(user.uid);
        setReferrals(userReferrals);
        
        // Generar código de referido si no existe
        const code = generateReferralCode(user.uid);
        setReferralCode(code);
      } catch (error) {
        console.error('Error cargando referidos:', error);
        Alert.alert('Error', 'No se pudieron cargar los referidos');
      } finally {
        setLoading(false);
      }
    };

    loadReferrals();
  }, [user]);

  const shareReferralCode = async () => {
    if (!referralCode) return;

    try {
      const result = await Share.share({
        message: `¡Únete a Pergamino App con mi código de referido: ${referralCode} y obtén beneficios exclusivos! https://pergamino.app/referral/${referralCode}`,
        title: 'Únete a Pergamino App'
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`Compartido con: ${result.activityType}`);
        } else {
          console.log('Compartido exitosamente');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Compartir cancelado');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el código de referido');
    }
  };

  const renderReferral = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.referredName}</Title>
        <Paragraph>Registrado: {new Date(item.timestamp).toLocaleDateString()}</Paragraph>
        <Paragraph>Estado: {item.status === 'active' ? 'Activo' : 'Inactivo'}</Paragraph>
        <Paragraph>Puntos otorgados: {item.pointsAwarded}</Paragraph>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Cargando referidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.codeContainer}>
        <Text style={styles.title}>Tu código de referido</Text>
        <Text style={styles.referralCode}>{referralCode}</Text>
        <Button 
          mode="contained" 
          onPress={shareReferralCode}
          icon="share"
          style={styles.shareButton}
        >
          Compartir Código
        </Button>
      </View>

      <Text style={styles.sectionTitle}>Tus Referidos ({referrals.length})</Text>
      {referrals.length > 0 ? (
        <FlatList
          data={referrals}
          renderItem={renderReferral}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aún no tienes referidos</Text>
          <Text style={styles.emptySubtext}>Comparte tu código para invitar a tus amigos</Text>
          <TouchableOpacity onPress={shareReferralCode} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Compartir Ahora</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  codeContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  referralCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
    marginVertical: 8,
    letterSpacing: 1,
  },
  shareButton: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    marginBottom: 12,
  },
  listContainer: {
    paddingBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
