import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card, Switch, Menu, HelperText, ActivityIndicator, List } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getTrackingTableConfig, addTrackingRecord } from '../../services/trackingTableService';
import { useAuth } from '../../context/AuthContext';

const TrackingForm = ({ tableId, onSuccess, onCancel }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tableConfig, setTableConfig] = useState(null);
    const [formValues, setFormValues] = useState({});
    const [errors, setErrors] = useState({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateFieldName, setDateFieldName] = useState('');
    const [dropdownField, setDropdownField] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState(false);

    // Cargar configuración de la tabla
    useEffect(() => {
        loadTableConfig();
    }, [tableId]);

    const loadTableConfig = async () => {
        try {
            setLoading(true);
            const config = await getTrackingTableConfig(tableId);
            setTableConfig(config);

            // Inicializar valores del formulario
            const initialValues = {};
            config.columns.forEach(col => {
                switch (col.type) {
                    case 'boolean':
                        initialValues[col.field] = false;
                        break;
                    case 'number':
                        initialValues[col.field] = 0;
                        break;
                    case 'date':
                        initialValues[col.field] = new Date();
                        break;
                    default:
                        initialValues[col.field] = '';
                        break;
                }
            });

            setFormValues(initialValues);
        } catch (error) {
            console.error('Error loading table config:', error);
            Alert.alert('Error', 'No se pudo cargar la configuración de la tabla');
            onCancel();
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormValues({
            ...formValues,
            [field]: value
        });

        // Limpiar error si existe
        if (errors[field]) {
            setErrors({
                ...errors,
                [field]: null
            });
        }
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);

        if (selectedDate && dateFieldName) {
            handleInputChange(dateFieldName, selectedDate);
        }
    };

    const openDatePicker = (fieldName) => {
        setDateFieldName(fieldName);
        setShowDatePicker(true);
    };

    const handleDropdownOpen = (fieldName) => {
        setDropdownField(fieldName);
        setDropdownVisible(true);
    };

    const handleDropdownSelect = (value) => {
        handleInputChange(dropdownField, value);
        setDropdownVisible(false);
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        tableConfig.columns.forEach(col => {
            const value = formValues[col.field];

            // Validar campos requeridos
            if (col.required && (value === undefined || value === null || value === '')) {
                newErrors[col.field] = 'Este campo es obligatorio';
                isValid = false;
            }

            // Validación específica por tipo
            if (value !== undefined && value !== null && value !== '') {
                switch (col.type) {
                    case 'number':
                        if (isNaN(Number(value))) {
                            newErrors[col.field] = 'Debe ser un número';
                            isValid = false;
                        }
                        break;
                    // Otras validaciones específicas pueden agregarse aquí
                }
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            Alert.alert('Error', 'Por favor corrija los errores en el formulario');
            return;
        }

        try {
            setSaving(true);

            // Preparar datos (convertir a los tipos correctos)
            const data = {};
            tableConfig.columns.forEach(col => {
                const value = formValues[col.field];

                if (value !== undefined && value !== null) {
                    switch (col.type) {
                        case 'number':
                            data[col.field] = Number(value);
                            break;
                        case 'boolean':
                            data[col.field] = Boolean(value);
                            break;
                        default:
                            data[col.field] = value;
                            break;
                    }
                }
            });

            // Guardar en Firestore
            await addTrackingRecord(tableId, data, user?.uid);

            Alert.alert(
                'Éxito',
                'Registro guardado correctamente',
                [{ text: 'OK', onPress: () => onSuccess() }]
            );
        } catch (error) {
            console.error('Error saving tracking record:', error);
            Alert.alert('Error', 'No se pudo guardar el registro');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!tableConfig) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                    No se pudo cargar la configuración de la tabla
                </Text>
                <Button mode="contained" onPress={onCancel}>
                    Volver
                </Button>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Title title={`Nuevo registro: ${tableConfig.name}`} />
                <Card.Content>
                    {tableConfig.columns.map(col => (
                        <View key={col.field} style={styles.fieldContainer}>
                            {col.type === 'boolean' ? (
                                <View style={styles.switchContainer}>
                                    <Text style={styles.switchLabel}>{col.label}</Text>
                                    <Switch
                                        value={formValues[col.field]}
                                        onValueChange={value => handleInputChange(col.field, value)}
                                    />
                                </View>
                            ) : col.type === 'date' ? (
                                <>
                                    <Button
                                        mode="outlined"
                                        onPress={() => openDatePicker(col.field)}
                                        style={styles.dateButton}
                                    >
                                        {col.label}: {formValues[col.field]?.toLocaleDateString() || 'Seleccionar'}
                                    </Button>
                                    {showDatePicker && dateFieldName === col.field && (
                                        <DateTimePicker
                                            value={formValues[col.field] || new Date()}
                                            mode="date"
                                            display="default"
                                            onChange={handleDateChange}
                                        />
                                    )}
                                </>
                            ) : col.type === 'dropdown' && col.options ? (
                                <>
                                    <Text style={styles.fieldLabel}>{col.label}</Text>
                                    <Button
                                        mode="outlined"
                                        onPress={() => handleDropdownOpen(col.field)}
                                        style={styles.dropdown}
                                    >
                                        {formValues[col.field] || 'Seleccionar'}
                                    </Button>
                                    <Menu
                                        visible={dropdownVisible && dropdownField === col.field}
                                        onDismiss={() => setDropdownVisible(false)}
                                        anchor={<View />} // Anchor necesario pero lo colocamos vía style
                                        style={styles.menu}
                                    >
                                        {col.options.map(option => (
                                            <Menu.Item
                                                key={option.value}
                                                title={option.label || option.value}
                                                onPress={() => handleDropdownSelect(option.value)}
                                            />
                                        ))}
                                    </Menu>
                                </>
                            ) : (
                                <>
                                    <TextInput
                                        label={col.label}
                                        value={formValues[col.field]?.toString() || ''}
                                        onChangeText={value => handleInputChange(col.field, value)}
                                        keyboardType={col.type === 'number' ? 'numeric' : 'default'}
                                        mode="outlined"
                                        error={!!errors[col.field]}
                                        style={styles.input}
                                    />
                                    {errors[col.field] && (
                                        <HelperText type="error" visible={!!errors[col.field]}>
                                            {errors[col.field]}
                                        </HelperText>
                                    )}
                                </>
                            )}
                        </View>
                    ))}
                </Card.Content>
                <Card.Actions style={styles.actions}>
                    <Button onPress={onCancel} style={styles.button}>
                        Cancelar
                    </Button>
                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        disabled={saving}
                        loading={saving}
                        style={styles.button}
                    >
                        Guardar
                    </Button>
                </Card.Actions>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    card: {
        marginBottom: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        marginBottom: 20,
        textAlign: 'center',
    },
    fieldContainer: {
        marginBottom: 16,
    },
    input: {
        marginBottom: 4,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    switchLabel: {
        fontSize: 16,
    },
    dateButton: {
        marginVertical: 8,
        justifyContent: 'flex-start',
    },
    dropdown: {
        marginVertical: 8,
        justifyContent: 'flex-start',
    },
    fieldLabel: {
        fontSize: 14,
        marginBottom: 4,
        color: '#666',
    },
    menu: {
        marginTop: 60, // Ajustar según sea necesario
    },
    actions: {
        justifyContent: 'flex-end',
        paddingTop: 8,
    },
    button: {
        marginLeft: 8,
    },
});

export default TrackingForm;