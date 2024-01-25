namespace pktExplorer.Pages;

public class AddressModel : SharedPageModel
{
    public bool isNetworkSteward = false;

    public AddressModel(IConfiguration config) : base(config)
    {
    }

    public void OnGet(string address)
    {
        if (address == "pkt1q6hqsqhqdgqfd8t3xwgceulu7k9d9w5t2amath0qxyfjlvl3s3u4sjza2g2") {
            isNetworkSteward = true;
        }
    }
}
