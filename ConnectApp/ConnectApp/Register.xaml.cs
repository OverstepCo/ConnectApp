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
	public partial class Register : ContentPage
	{
		public Register ()
		{
			InitializeComponent ();
		}

        async void Register_Clicked(object sender, System.EventArgs e)
        {
            if (CheckValidations())
            {
                var token = await DependencyService.Get<IFirebaseAuthenticator>().RegsiterWithEmailPassword(txtEmail.Text, txtPassword.Text);
                await DisplayAlert("Alert", "Registered!" + token, "ok");
                await Navigation.PopAsync();
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
            else if (txtPassword.Text.Length < 6)
            {
                DisplayAlert("Alert", "Password must be at least 6 characters long.", "ok");
                return false;
            }
            else if (!txtPassword.Text.Equals(txtConfirmPassword.Text))
            {
                DisplayAlert("Alert", "Passwords do not match", "ok");
                return false;
            }
            return true;
        }
    }
}