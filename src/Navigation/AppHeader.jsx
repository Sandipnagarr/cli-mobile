import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function AppHeader() {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/MLLogo.png')}
                  style={styles.logo
                      
                  }
             
        />

        <Text style={styles.title}>ML Weather</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#08437a',
  },

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#08437a',
  },

  logo: {
    width: 32,
    height: 32,
    marginRight: 10,
    tintColor: '#fff',
  },

  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
