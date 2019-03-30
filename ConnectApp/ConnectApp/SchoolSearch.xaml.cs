using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace ConnectApp
{
	[XamlCompilation(XamlCompilationOptions.Compile)]
	public partial class SchoolSearch : ContentPage
	{
        ObservableCollection<School> schools = new ObservableCollection<School>();


        public SchoolSearch ()
		{
			InitializeComponent ();
            SchoolView.ItemsSource = schools;

        }


        

        private void SearchButton_Clicked(object sender, EventArgs e)
        {
            schools.Add(new School { DisplayName = "Payson Christian School" });
            schools.Add(new School { DisplayName = "Payson Elementary School" });
            schools.Add(new School { DisplayName = "Payson High School" });
            schools.Add(new School { DisplayName = "Payson Middle School" });
            schools.Add(new School { DisplayName = "foo" });
            schools.Add(new School { DisplayName = "goo" });
        }
    }


}

public class School
{
    public string DisplayName { get; set; }

}


