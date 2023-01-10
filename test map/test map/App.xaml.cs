using System;
using test_map.Services;
using test_map.Views;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace test_map
{
    public partial class App : Application
    {

        public App()
        {
            InitializeComponent();

            DependencyService.Register<MockDataStore>();
            MainPage = new testmap();
        }

        protected override void OnStart()
        {
        }

        protected override void OnSleep()
        {
        }

        protected override void OnResume()
        {
        }
    }
}
