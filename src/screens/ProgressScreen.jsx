import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from "react-native-gifted-charts";

const ProgressScreen = () => {
  // Random data points for the Blue Line
  const lineData = [
    {value: 500, label: 'JAN'},
    {value: 400, label: ''},
    {value: 450, label: 'FEB'},
    {value: 650, label: ''},
    {value: 550, label: 'MAR'},
    {value: 150, label: 'APR'},
    {value: 300, label: 'MAY'},
    {value: 150, label: 'JUN'},
  ];

  // Random data points for the Pink Line
  const lineData2 = [
    {value: 350},
    {value: 480},
    {value: 150},
    {value: 250},
    {value: 300},
    {value: 280},
    {value: 220},
    {value: 50},
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
      <LineChart
        // areaChart
        curved
        data={lineData}
        data2={lineData2}
        height={250}
        width={Dimensions.get('window').width - 80}
        initialSpacing={10}
        color1="#54a5ff" // Blue line
        color2="#ff9999" // Pink line
        hideDataPoints // Matches your image (no circles on points)
        thickness={2}
        startFillColor1="rgba(84, 165, 255, 0.1)"
        startFillColor2="rgba(255, 153, 153, 0.1)"
        noOfSections={3}
        yAxisColor="lightgray"
        yAxisThickness={0}
        rulesType="solid"
        rulesColor="rgba(0,0,0,0.05)"
        xAxisColor="lightgray"
        pointerConfig={{
            pointerStripColor: 'lightgray',
            pointerConfig: {
                radius: 4,
            }
        }}
      />
    </View>
  );
};

export default ProgressScreen;