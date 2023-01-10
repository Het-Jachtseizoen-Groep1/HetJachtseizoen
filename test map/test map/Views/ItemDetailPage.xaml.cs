using System.ComponentModel;
using test_map.ViewModels;
using Xamarin.Forms;

namespace test_map.Views
{
    public partial class ItemDetailPage : ContentPage
    {
        public ItemDetailPage()
        {
            InitializeComponent();
            BindingContext = new ItemDetailViewModel();
        }
    }
}