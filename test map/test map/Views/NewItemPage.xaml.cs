using System;
using System.Collections.Generic;
using System.ComponentModel;
using test_map.Models;
using test_map.ViewModels;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace test_map.Views
{
    public partial class NewItemPage : ContentPage
    {
        public Item Item { get; set; }

        public NewItemPage()
        {
            InitializeComponent();
            BindingContext = new NewItemViewModel();
        }
    }
}