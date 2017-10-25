package selenium.tests;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.util.List;

import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
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
	private static String user = System.getenv("username");
	private static String pass = System.getenv("password");
	private static CloseableHttpClient httpClient = HttpClientBuilder.create().build();
	private static String serverAddress = "http://13.59.112.43:3000";
	
	@BeforeClass // runs before testSuite
	public static void preSetUp() throws Exception{
		CloseableHttpClient httpClient = HttpClientBuilder.create().build();
		HttpPost httpPost = new HttpPost(serverAddress + "/successBuild");
		StringEntity params = new StringEntity("{\"commitID\":\"34fc1208c7b241f81b128996ca3f52cb2429cfc3\","
				+ "\"AuthorName\":\"mbehroo\", "
				+ "\"source\":\"SeleniumTest\"} ");
		httpPost.setEntity(params);
		httpPost.setHeader("Content-type", "application/json");
		httpClient.execute(httpPost);
		httpClient.close();
	}
	
	@Before // runs before every testCase
	public void setUp() throws Exception 
	{
		ChromeDriverManager.getInstance().setup();
		driver = new ChromeDriver();
	}
	
	@After // runs after every testCase
	public void tearDown() throws Exception
	{
		driver.close();
		driver.quit();
	}
	
	@AfterClass // runs after testSuite
	public static void cleanUp() throws Exception{	
		CloseableHttpClient httpClient = HttpClientBuilder.create().build();
		HttpPost httpPost = new HttpPost(serverAddress + "/successBuild");
		StringEntity params = new StringEntity("{\"commitID\":\"34fc1208c7b241f81b128996ca3f52cb2429cfc3\","
				+ "\"AuthorName\":\"mbehroo\", "
				+ "\"source\":\"SeleniumTest\"} ");
		httpPost.setEntity(params);
		httpPost.setHeader("Content-type", "application/json");
		httpClient.execute(httpPost);
		httpClient.close();
	}
	
	@Test
	public void createStableBranchTest() throws Exception{
		HttpPost httpPost = new HttpPost(serverAddress + "/failBuild");
		StringEntity params = new StringEntity("{\"commitID\":\"34fc1208c7b241f81b128996ca3f52cb2429cfc3\","
				+ "\"AuthorName\":\"mbehroo\", "
				+ "\"source\":\"SeleniumTest\"} ");
		httpPost.setEntity(params);
		httpPost.setHeader("Content-type", "application/json");
		httpClient.execute(httpPost);
		String signInPath = "//input[@class='btn btn-primary btn-block']";
		driver.get("https://github.ncsu.edu/pulseBotProject/MavenVoid");
		WebDriverWait wait = new WebDriverWait(driver, 30);
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(signInPath)));
		WebElement email = driver.findElement(By.id("login_field"));
		WebElement password = driver.findElement(By.id("password"));
		email.sendKeys(user);
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
		Thread.sleep(5000);
		String branchNamePath = "//span[contains(.,'testStable')]";
		WebElement branch = driver.findElement(By.xpath(branchNamePath));
		assertNotNull(branch);
	}
	
	@Test
	public void deleteStableBranchTest() throws Exception{
		HttpPost httpPost = new HttpPost(serverAddress + "/successBuild");
		StringEntity params = new StringEntity("{\"commitID\":\"063df6f74d63b8c4c9b7cfe71ed60024cae8bb67\","
				+ "\"AuthorName\":\"mbehroo\", "
				+ "\"source\":\"SeleniumTest\"} ");
		httpPost.setEntity(params);
		httpPost.setHeader("Content-type", "application/json");
		httpClient.execute(httpPost);
		String signInPath = "//input[@class='btn btn-primary btn-block']";
		driver.get("https://github.ncsu.edu/pulseBotProject/MavenVoid");
		WebDriverWait wait = new WebDriverWait(driver, 30);
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(signInPath)));
		WebElement email = driver.findElement(By.id("login_field"));
		WebElement password = driver.findElement(By.id("password"));
		email.sendKeys(user);
		password.sendKeys(pass);
		
		WebElement signin = driver.findElement(By.xpath(signInPath));
		signin.click();
		wait.until(ExpectedConditions.titleContains("MavenVoid"));
		driver.get("https://github.ncsu.edu/pulseBotProject/MavenVoid");
		wait.until(ExpectedConditions.titleContains("MavenVoid"));
		String branchButtonPath = "//button[@aria-label='Switch branches or tags']";
		WebElement branchButton = driver.findElement(By.xpath(branchButtonPath));
		branchButton.click();
		Thread.sleep(5000);
		String branchNamePath = "//span[contains(.,'testStable')]";
		List<WebElement> branches = driver.findElements(By.xpath(branchNamePath));
		assertEquals(branches.size(),0);
	}
}