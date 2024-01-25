using Microsoft.AspNetCore.Mvc.RazorPages;

namespace pktExplorer.Pages;

public class SharedPageModel : PageModel
{
    public string websiteCreator = "";
    public string websiteName = "";
    public string websiteDomain = "";
    public string apiUrl = "";
    public string donationAddress = "";
    public string donationAddressCompressed = "";
    public bool showEcosystemTiles = true;
    public bool showPriceInfo = true;

    public SharedPageModel(IConfiguration config)
    {
        websiteCreator = config["WebsiteCreator"] ?? "";
        websiteName = config["WebsiteName"] ?? "";
        websiteDomain = config["WebsiteDomain"] ?? "";
        apiUrl = config["ApiUrl"] ?? "";
        donationAddress = config["DonationAddress"] ?? "pkt1q6sj0mchq7ltwm8c9tpm2wteqmeldr2ye5lcr60";
        donationAddressCompressed = donationAddress.Substring(0, 6) + "..." + donationAddress.Substring(donationAddress.Length - 6, 6);
        showEcosystemTiles = config["ShowEcosystemTiles"] == "true";
        showPriceInfo = config["ShowPriceInfo"] == "true";
    }
}
