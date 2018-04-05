
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Scanner;

public class DamoclesAdminTest{
    static String username = "admin";
    static String password = "password";
    static String googleAuth = "";
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter Admin's Google Authenticator Code: ");
        googleAuth = sc.next();

        System.setProperty("webdriver.chrome.driver", "chromedriver");
        WebDriver driver = new ChromeDriver();
        driver.get("localhost:3000");

        WebElement user = driver.findElement(By.id("username"));
        WebElement pass = driver.findElement(By.id("password"));
        WebElement code = driver.findElement(By.id("code"));
        WebElement loginBtn = driver.findElement(By.className("btn"));
        user.clear();
        pass.clear();
        code.clear();
        user.sendKeys(username);
        pass.sendKeys(password);
        code.sendKeys(googleAuth);

        try {
            Thread.sleep(2000);
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        loginBtn.click();

        try {
            Thread.sleep(3000);
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        // get all the links after logging in
        java.util.List<WebElement> links = driver.findElements(By.tagName("a"));
        System.out.println("Number of links: " + links.size());
        for (int i = 0; i < links.size(); i = i + 1) {
            System.out.println(i + " " + links.get(i).getText());
        }
        WebElement link = null;
        for (int i = 0; i < links.size(); i++) {
            System.out.println("*** Navigating to" + " " + links.get(i).getAttribute("href"));
            if (links.get(i).getAttribute("href") == null)
                continue;
            if ((links.get(i).getText()).equals("Logout")) {
                link = links.get(i);
                continue;
            }
            boolean staleElementLoaded = true;
            while (staleElementLoaded) {
                try {
                    driver.navigate().to(links.get(i).getAttribute("href"));
                    try {
                        Thread.sleep(3000);
                    } catch (Exception ex) {
                        ex.printStackTrace();
                    }

                    driver.navigate().back();
                    links = driver.findElements(By.tagName("a"));
                    System.out.println("*** Navigated to" + " " + links.get(i).getAttribute("href"));
                    staleElementLoaded = false;
                } catch (StaleElementReferenceException e) {
                    staleElementLoaded = true;
                }
            }
        }
        System.out.println("Test Ended");
        driver.close();
    }
}