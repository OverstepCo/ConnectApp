using System;

using Android.App;
using Android.Content.PM;
using Android.Runtime;
using Android.Views;
using Android.Widget;
using Android.OS;

namespace ConnectApp.Droid
{
    [Activity(Label = "ConnectApp", Icon = "@mipmap/icon", Theme = "@style/MainTheme", MainLauncher = true, ConfigurationChanges = ConfigChanges.ScreenSize | ConfigChanges.Orientation)]
    public class MainActivity : global::Xamarin.Forms.Platform.Android.FormsAppCompatActivity
    {
        protected override void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            TabLayoutResource = Resource.Layout.Tabbar;
            ToolbarResource = Resource.Layout.Toolbar;
            Firebase.FirebaseApp.InitializeApp(Application.Context);
            global::Xamarin.Forms.Forms.Init(this, savedInstanceState);
            Firebase.FirebaseApp.InitializeApp(this);
            LoadApplication(new App());
        }
    }
}