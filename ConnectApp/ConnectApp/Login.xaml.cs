using FirebaseAuthentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace ConnectApp
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class Login : ContentPage
    {
        public Login()
        {
            InitializeComponent();
        }

        async void Register_Clicked(object sender, System.EventArgs e)
        {
            await Navigation.PushAsync(new SchoolSearch());
        }

        async void Login_Clicked(object sender, System.EventArgs e)
        {
            if (CheckValidations())
            {
                try
                {
                    var token = await DependencyService.Get<IFirebaseAuthenticator>().LoginWithEmailPassword(txtEmail.Text, txtPassword.Text);
                } catch(Exception) {
                    await DisplayAlert("Alert", "Invalid email or password", "ok");
                    return;
                }

                App.Current.MainPage = new Main();
            }

        }
        private bool CheckValidations()
        {
            if (string.IsNullOrEmpty(txtEmail.Text))
            {
                DisplayAlert("Alert", "Enter email", "ok");
                return false;
            }
            else if (!txtEmail.Text.Contains('@') || !txtEmail.Text.Contains('.'))
            {
                DisplayAlert("Alert", "Enter valid email address", "ok");
                return false;
            }
            if (string.IsNullOrEmpty(txtPassword.Text))
            {

                DisplayAlert("Alert", "Enter password", "ok");
                return false;
            }
            return true;
        }
    }
}