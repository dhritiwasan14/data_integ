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
import java.util.Random;
import java.lang.StringBuilder;

public class DamoclesRegistrationTest {

    static public String getSaltString() {
        String SALTCHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        StringBuilder salt = new StringBuilder();
        Random random = new Random();
        Random rnd = new Random();
        while (salt.length() < random.nextInt(10)) { // length of the random string.
            int index = (int) (rnd.nextFloat() * SALTCHARS.length());
            salt.append(SALTCHARS.charAt(index));
        }
        String saltStr = salt.toString();
        return saltStr;

    }

    public static void main(String[] args) {
        System.setProperty("webdriver.chrome.driver", "chromedriver");
        WebDriver driver = new ChromeDriver();
        driver.get("localhost:3000/signup");

        System.out.println("Starting Test");
        System.out.println("Sending random values into signup page which should not work");

        for (int i = 0; i < 20; i++) {
            try {
                
                System.out.println("Try number: " + i);
                Thread.sleep(2000);
                WebElement user = driver.findElement(By.id("username"));
                WebElement pass = driver.findElement(By.id("password"));
                WebElement cpass = driver.findElement(By.id("confirmPassword"));
                WebElement submitBtn = driver.findElement(By.className("btn"));

                user.clear();
                pass.clear();
                cpass.clear();
                user.sendKeys(getSaltString());
                pass.sendKeys(getSaltString());
                cpass.sendKeys(getSaltString());
                submitBtn.click();
                System.out.println("Completed " + i);

            } catch (Exception ex) {
                ex.printStackTrace();
            }

        }

        System.out.println("Testing Ended");
        driver.close();
    }

}