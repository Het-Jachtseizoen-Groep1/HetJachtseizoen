using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xamarin.Essentials;
using Xamarin.Forms;
using Xamarin.Forms.Maps;
using Xamarin.Forms.Xaml;

namespace test_map.Views
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class testmap : ContentPage
    {
        public testmap()
        {
            InitializeComponent();
            GetLocation();

        }

        private async Task GetLocation()
        {
            var result = await Geolocation.GetLocationAsync(new GeolocationRequest(GeolocationAccuracy.Best, TimeSpan.FromSeconds(10)));
            Debug.WriteLine($"-------------------------latitude: {result.Latitude}");
            var position = new Position(result.Latitude, result.Longitude);

            var pin = new Pin
            {
            Type = PinType.Place,
            Position = position,
            Label = "Boeven"
            };
            MyMap.Pins.Add(pin);
            MyMap.MoveToRegion(MapSpan.FromCenterAndRadius(position, Distance.FromMiles(1)));
        }


    }
}