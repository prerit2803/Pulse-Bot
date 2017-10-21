package selenium.tests;

import static org.junit.Assert.*;

import java.util.List;

import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import io.github.bonigarcia.wdm.ChromeDriverManager;

public class githubBranchTest
{
	private static WebDriver driver;
	private static String pass = "ENTER YOUR PASSWORD HERE";
	
	@Before
	public void setUp() throws Exception 
	{
		ChromeDriverManager.getInstance().setup();
		driver = new ChromeDriver();
	}
	
	@After
	public void  tearDown() throws Exception
	{
		driver.close();
		driver.quit();
	}
	
	@Test
	public void createStableBranchTest() throws Exception{
		CloseableHttpClient httpClient = HttpClientBuilder.create().build();
		HttpPost httpPost = new HttpPost("http://13.59.112.43:3000/failBuild");
		StringEntity params =new StringEntity("{\"commitID\":\"063df6f74d63b8c4c9b7cfe71ed60024cae8bb67\",\"AuthorName\":\"AuthorName\"} ");
		httpPost.setEntity(params);
		httpPost.setHeader("Content-type", "application/json");
		HttpResponse  response = httpClient.execute(httpPost);
		String signInPath = "//input[@class='btn btn-primary btn-block']";
		driver.get("https://github.ncsu.edu/pulseBotProject/MavenVoid");
		WebDriverWait wait = new WebDriverWait(driver, 30);
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(signInPath)));
		WebElement email = driver.findElement(By.id("login_field"));
		WebElement password = driver.findElement(By.id("password"));
		email.sendKeys("sshah11");
		password.sendKeys(pass);
		
		WebElement signin = driver.findElement(By.xpath(signInPath));
		signin.click();
		assertTrue(true);
		wait.until(ExpectedConditions.titleContains("MavenVoid"));
		driver.get("https://github.ncsu.edu/pulseBotProject/MavenVoid");
		wait.until(ExpectedConditions.titleContains("MavenVoid"));
		String branchButtonPath = "//button[@aria-label='Switch branches or tags']";
		WebElement branchButton = driver.findElement(By.xpath(branchButtonPath));
		branchButton.click();
		
		String branchNamePath = "//span[contains(.,'stable')]";
		WebElement branch = driver.findElement(By.xpath(branchNamePath));
		assertNotNull(branch);
	}
	
	@Test
	public void deleteStableBranchTest() throws Exception{
		CloseableHttpClient httpClient = HttpClientBuilder.create().build();
		HttpPost httpPost = new HttpPost("http://13.59.112.43:3000/successBuild");
		StringEntity params =new StringEntity("{\"commitID\":\"063df6f74d63b8c4c9b7cfe71ed60024cae8bb67\",\"AuthorName\":\"AuthorName\"} ");
		httpPost.setEntity(params);
		httpPost.setHeader("Content-type", "application/json");
		HttpResponse  response = httpClient.execute(httpPost);
		String signInPath = "//input[@class='btn btn-primary btn-block']";
		driver.get("https://github.ncsu.edu/pulseBotProject/MavenVoid");
		WebDriverWait wait = new WebDriverWait(driver, 30);
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(signInPath)));
		WebElement email = driver.findElement(By.id("login_field"));
		WebElement password = driver.findElement(By.id("password"));
		email.sendKeys("sshah11");
		password.sendKeys(pass);
		
		WebElement signin = driver.findElement(By.xpath(signInPath));
		signin.click();
		wait.until(ExpectedConditions.titleContains("MavenVoid"));
		driver.get("https://github.ncsu.edu/pulseBotProject/MavenVoid");
		wait.until(ExpectedConditions.titleContains("MavenVoid"));
		String branchButtonPath = "//button[@aria-label='Switch branches or tags']";
		WebElement branchButton = driver.findElement(By.xpath(branchButtonPath));
		branchButton.click();
		
		String branchNamePath = "//span[contains(.,'stable')]";
		List<WebElement> branches = driver.findElements(By.xpath(branchNamePath));
		assertEquals(branches.size(),0);
	}
}