/* ============================================================
   Java Development — Question Bank (Spring Boot · JPA/Hibernate ·
   REST · JUnit/Mockito · SOLID · GoF patterns · Microservices · IAM)
   Theory exam format: MC (one answer) · multi (choose all) ·
   fill (fill the gap). Closed book, 30–45 min.
   Built on the Restaurant App + logistics microservices course.
   Each attempt draws fresh questions from the pools below.
   Topic tags: Arch Inherit Assoc Streams Test SOLID Patterns Micro Security
   ============================================================ */

const JAVA_BANK = {

/* ---------- STANDARD POOL (1 pt each) ---------- */
standard: [

 // ---- Topic 1: Spring Layered Architecture (JPA & REST) ----
 {t:"mc",topic:"Arch",q:"A request flows Controller → Service → Repository → Entity. Where do you put the business rule 'an order over €100 gets free delivery'?",
  o:["The Controller, next to the mapping","The Service layer","The Repository","The Entity getter"],a:"The Service layer",
  e:"Business logic + transactions live in the @Service. Controllers only handle HTTP; repositories only persist."},
 {t:"mc",topic:"Arch",q:"Your entity is `class Order`. On startup Hibernate fails with a SQL syntax error near 'order'. The fix is:",
  o:["Rename the Java class to Orders","Add `@Table(name=\"orders\")`","Add `@Column` on every field","Switch GenerationType to SEQUENCE"],a:"Add `@Table(name=\"orders\")`",
  e:"`order` is a reserved SQL keyword, so the generated `create table order` is invalid. Map it to a safe table name."},
 {t:"multi",topic:"Arch",q:"Which are valid `GenerationType` values for `@GeneratedValue`? (choose all)",
  o:["AUTO","IDENTITY","AUTOINCREMENT","SEQUENCE","TABLE"],a:["AUTO","IDENTITY","SEQUENCE","TABLE"],
  e:"AUTO, IDENTITY, SEQUENCE, TABLE are the four. AUTOINCREMENT is a MySQL DDL keyword, not a JPA strategy."},
 {t:"fill",topic:"Arch",q:"In JPQL the keywords (SELECT, FROM…) are case-______, but class and attribute names are case-______. (one word each, space-separated)",
  accept:["insensitive sensitive","case-insensitive case-sensitive"],e:"`SELECT m FROM MenuItem m` works, but `MenuItem.Name` ≠ `MenuItem.name` — names are case-sensitive."},
 {t:"mc",topic:"Arch",q:"`menuItemRepository.findById(7)` returns an `Optional<MenuItem>`. You want the item or a thrown exception. Which is correct?",
  o:[".get() always","`.orElseThrow(() -> new NotFoundException())`","`.isPresent()` then return null","`.orElse(get())`"],a:"`.orElseThrow(() -> new NotFoundException())`",
  e:"orElseThrow unwraps the value or raises your exception. Calling .get() on an empty Optional throws NoSuchElementException blindly."},
 {t:"mc",topic:"Arch",q:"You need to return HTTP 201 with the created body and a Location header. The return type to use is:",
  o:["The entity directly","`ResponseEntity<MenuItemDto>`","`void`","`Optional<MenuItem>`"],a:"`ResponseEntity<MenuItemDto>`",
  e:"ResponseEntity gives you full control of status code, headers and body. Returning the entity alone always defaults to 200."},
 {t:"multi",topic:"Arch",q:"Which are valid ways to inject a `MenuItemService` into a controller in this course's style? (choose all)",
  o:["Constructor injection","Field `@Autowired`","`new MenuItemService()`","A static factory call"],a:["Constructor injection","Field `@Autowired`"],
  e:"Spring injects beans (constructor — preferred — or @Autowired field). `new` bypasses the container so dependencies are null."},
 {t:"mc",topic:"Arch",q:"`List<MenuItem> findByPriceGreaterThan(double p);` in a JpaRepository works with no body because it is a:",
  o:["JPQL @Query you forgot to write","derived query (Spring parses the method name)","native SQL stored procedure","cached view"],a:"derived query (Spring parses the method name)",
  e:"Spring Data derives the query from the method name. For anything more complex you write @Query (JPQL)."},

 // ---- Topic 2: Inheritance in JPA + Lambda & Streams ----
 {t:"mc",topic:"Inherit",q:"You want every subclass of `Payment` in ONE table with a `dtype` column distinguishing them. Which strategy?",
  o:["JOINED","TABLE_PER_CLASS","SINGLE_TABLE","@MappedSuperclass"],a:"SINGLE_TABLE",
  e:"SINGLE_TABLE = one table + a discriminator column. JOINED splits to a table per class joined by FK; TABLE_PER_CLASS gives each concrete class its own full table."},
 {t:"fill",topic:"Inherit",q:"With `TABLE_PER_CLASS` you must replace `GenerationType.IDENTITY` with `GenerationType.______`, otherwise subclass tables produce ______ IDs. (word, word)",
  accept:["table duplicate","TABLE duplicate"],e:"Each subclass table would restart its own IDENTITY counter → colliding IDs. A shared TABLE generator keeps IDs unique across them."},
 {t:"mc",topic:"Inherit",q:"`@MappedSuperclass` differs from `@Inheritance` because the superclass:",
  o:["gets its own table","is not an entity and maps no table — fields are just copied down","needs a discriminator column","can only be abstract in JOINED mode"],a:"is not an entity and maps no table — fields are just copied down",
  e:"A @MappedSuperclass shares mappings (e.g. id, createdAt) with subclasses but is never queried or persisted on its own."},
 {t:"mc",topic:"Inherit",q:"A query that returns `Vehicle` AND all its subclasses (Car, Truck…) in one go is called a:",
  o:["native query","polymorphic query","projection","derived query"],a:"polymorphic query",
  e:"`SELECT v FROM Vehicle v` returns every subclass instance — that polymorphic behaviour is a key reason to use JPA inheritance."},
 {t:"mc",topic:"Streams",q:"A repository returns all orders; you keep only paid ones and sum their totals with `.stream().filter(...).mapToDouble(...).sum()`. The main downside vs doing it in the DB is:",
  o:["streams can't sum","you load every row into memory first","filter changes the list in place","it needs a transaction"],a:"you load every row into memory first",
  e:"Stream filtering happens in the JVM after fetching everything. A derived/JPQL query filters in the database and transfers less data."},
 {t:"mc",topic:"Streams",q:"Iterating a lazily-loaded `order.getItems()` inside a stream AFTER the service method returned throws:",
  o:["NullPointerException","LazyInitializationException","ConcurrentModificationException","StackOverflowError"],a:"LazyInitializationException",
  e:"The Hibernate session/transaction is closed, so the lazy collection can no longer be initialised."},

 // ---- Topic 3: Associations, DTOs & Mappers ----
 {t:"mc",topic:"Assoc",q:"In a bidirectional Order(1)—(*)OrderedItem with `@ManyToOne` on OrderedItem and `@OneToMany(mappedBy=\"order\")` on Order, the OWNING side is:",
  o:["Order (the @OneToMany side)","OrderedItem (the @ManyToOne side)","whichever has mappedBy","neither — they share it"],a:"OrderedItem (the @ManyToOne side)",
  e:"Owning side = the one WITHOUT mappedBy, and it holds the FK. It's always the @ManyToOne side here."},
 {t:"fill",topic:"Assoc",q:"`mappedBy` is placed on the ______ side and its value names the field on the ______ side. (word, word)",
  accept:["inverse owning","inverse-owning"],e:"mappedBy goes on the inverse (non-owning) @OneToMany side and points back to the owning side's field."},
 {t:"multi",topic:"Assoc",q:"Deleting an `Order` should also delete its `OrderedItem`s, and removing one item from the list should delete that row. Which do you add to the @OneToMany? (choose all)",
  o:["`cascade = CascadeType.ALL`","`orphanRemoval = true`","`@Transient`","`fetch = FetchType.LAZY` only"],a:["`cascade = CascadeType.ALL`","`orphanRemoval = true`"],
  e:"cascade ALL propagates the delete; orphanRemoval deletes children removed from the collection. @Transient would stop persistence entirely."},
 {t:"mc",topic:"Assoc",q:"Serializing a bidirectional Order↔OrderedItem to JSON causes an infinite loop. You annotate the child's back-reference with:",
  o:["`@JsonManagedReference`","`@JsonBackReference`","`@JsonProperty`","`@Enumerated`"],a:"`@JsonBackReference`",
  e:"@JsonManagedReference is the serialized (forward) side; @JsonBackReference is the side that is OMITTED to break the recursion."},
 {t:"mc",topic:"Assoc",q:"Why expose a `MenuItemDto` from the controller instead of the `MenuItem` entity directly?",
  o:["DTOs are faster to instantiate","to decouple the API shape from the DB and avoid leaking lazy associations","entities can't be serialized","Spring forbids returning entities"],a:"to decouple the API shape from the DB and avoid leaking lazy associations",
  e:"DTOs let the API contract evolve independently, hide internal fields, and dodge lazy-loading/serialization traps."},
 {t:"mc",topic:"Assoc",q:"A storing of a `Status` enum as readable text ('PAID','PENDING') in the column uses:",
  o:["`@Enumerated(EnumType.ORDINAL)`","`@Enumerated(EnumType.STRING)`","`@Embedded`","`@ElementCollection`"],a:"`@Enumerated(EnumType.STRING)`",
  e:"STRING stores the name; ORDINAL stores the index (0,1,2) which silently breaks if you reorder the enum constants."},

 // ---- Topic 4: Testing & Mocking (TDD) ----
 {t:"mc",topic:"Test",q:"In a service unit test you write `when(repo.findById(1)).thenReturn(Optional.of(item));`. That `repo` is a:",
  o:["Dummy","Stub (returns canned data)","Spy on a real object","Fake in-memory DB"],a:"Stub (returns canned data)",
  e:"A stub feeds preset answers via when().thenReturn(). A dummy is never used; a mock is verified for interactions."},
 {t:"mc",topic:"Test",q:"You pass a `null` logger just to satisfy a constructor parameter that the test never exercises. That double is a:",
  o:["Dummy","Stub","Mock","Spy"],a:"Dummy",
  e:"A dummy only fills a parameter slot; it's never actually called or asserted on."},
 {t:"fill",topic:"Test",q:"To test a controller's endpoints WITHOUT starting a real HTTP server, the course uses ______ to perform requests. (one identifier)",
  accept:["mockmvc"],e:"MockMvc drives the controller through the Spring MVC stack in-memory — fast integration tests, no port bound."},
 {t:"multi",topic:"Test",q:"A typical Mockito unit test of a service uses which of these? (choose all)",
  o:["`@Mock`","`@InjectMocks`","`@ExtendWith(MockitoExtension.class)`","`@Autowired MockMvc`"],a:["`@Mock`","`@InjectMocks`","`@ExtendWith(MockitoExtension.class)`"],
  e:"@Mock creates the doubles, @InjectMocks builds the unit with them injected, the extension wires Mockito. MockMvc belongs to controller integration tests."},
 {t:"fill",topic:"Test",q:"The TDD micro-cycle is: ______ → ______ → refactor. (two colours)",
  accept:["red green","red-green"],e:"Red: write a failing test. Green: write the minimum code to pass. Then refactor with the safety net in place."},
 {t:"mc",topic:"Test",q:"You want to assert the service called `repo.save(...)` with an item whose price was set to 0. The cleanest Mockito tool is:",
  o:["a second when().thenReturn()","`verify` with an `ArgumentCaptor`","a try/catch","Thread.sleep then assert"],a:"`verify` with an `ArgumentCaptor`",
  e:"ArgumentCaptor captures the actual argument passed to a verified call so you can assert on its fields."},

 // ---- Topic 5: SOLID & Refactoring ----
 {t:"mc",topic:"SOLID",q:"You replace a growing `switch(account.type)` with `Account` subclasses that each override `calculateInterest()`. This mainly satisfies:",
  o:["SRP","OCP (open for extension, closed for modification)","LSP","ISP"],a:"OCP (open for extension, closed for modification)",
  e:"A new account type now means a new subclass, not editing the switch. Open for extension, closed for modification."},
 {t:"fill",topic:"SOLID",q:"GRASP answers '______ does what?' while design patterns answer 'how objects ______?'. (word, word)",
  accept:["who collaborate"],e:"GRASP = responsibility assignment (who). Patterns = how objects collaborate to fulfil those responsibilities."},
 {t:"mc",topic:"SOLID",q:"'Assign the responsibility to the class that already holds the information it needs' is the GRASP pattern:",
  o:["Controller","Creator","Information Expert","Low Coupling"],a:"Information Expert",
  e:"Information Expert puts behaviour where the data lives, reducing the need to expose internals to other classes."},
 {t:"mc",topic:"SOLID",q:"A class injects a 10-method `NotificationService` but only ever calls `sendEmail`. Splitting that interface respects which principle?",
  o:["SRP","OCP","LSP","ISP (no client depends on methods it doesn't use)"],a:"ISP (no client depends on methods it doesn't use)",
  e:"Interface Segregation: prefer small, focused interfaces over one fat one that forces clients to depend on unused methods."},
 {t:"mc",topic:"SOLID",q:"After refactoring, your previously-green tests must:",
  o:["be rewritten","change behaviour with the code","still pass unchanged — refactoring preserves external behaviour","be deleted"],a:"still pass unchanged — refactoring preserves external behaviour",
  e:"Refactoring improves internal structure WITHOUT changing observable behaviour, so the existing tests stay green."},

 // ---- Topic 6: Design Patterns ----
 {t:"mc",topic:"Patterns",q:"A `ConfigManager` with a private constructor and a static `getInstance()` returning one shared object is the … pattern:",
  o:["Strategy","Observer","Singleton","Decorator"],a:"Singleton",
  e:"Singleton = private constructor + static accessor guaranteeing a single instance with a global access point."},
 {t:"mc",topic:"Patterns",q:"You wrap a `Coffee` in a `MilkDecorator` that holds a reference to the coffee and adds €0.50 in its `getPrice()`. This is:",
  o:["Decorator","Strategy","Observer","Singleton"],a:"Decorator",
  e:"Decorator adds responsibilities by wrapping a component and holding a reference to it, exposing the same interface."},
 {t:"multi",topic:"Patterns",q:"Which of these are BEHAVIOURAL GoF patterns? (choose all)",
  o:["Observer","Strategy","Singleton","Decorator"],a:["Observer","Strategy"],
  e:"Observer & Strategy are behavioural. Singleton is creational; Decorator is structural."},
 {t:"fill",topic:"Patterns",q:"In the Strategy pattern, the ______ object is configured with a concrete strategy and delegates to it through the shared interface. (one word)",
  accept:["context"],e:"The Context holds a Strategy reference and calls it polymorphically; swapping the strategy changes the algorithm at runtime."},
 {t:"mc",topic:"Patterns",q:"In the Observer pattern, how does the subject tell observers something changed?",
  o:["observers poll the subject on a timer","the subject calls each observer's `update()`","a database trigger fires","the controller pushes it"],a:"the subject calls each observer's `update()`",
  e:"Observers register with the subject; on a change the subject notifies them by invoking their update() method (push)."},
 {t:"mc",topic:"Patterns",q:"The key difference between Strategy and Decorator is:",
  o:["Strategy is creational, Decorator behavioural","the context SELECTS a strategy; a decorator WRAPS and holds a reference to the component","Strategy needs inheritance, Decorator doesn't","they are the same with different names"],a:"the context SELECTS a strategy; a decorator WRAPS and holds a reference to the component",
  e:"Both compose via an interface, but a decorator wraps/forwards to the wrapped object, whereas a context just delegates to a chosen strategy."},

 // ---- Topic 7: Microservices ----
 {t:"mc",topic:"Micro",q:"After splitting the Restaurant App into a MenuItem service and an Order service, the Order should reference a menu item by its:",
  o:["database `id`","`barcode` (a stable business key)","the table name","a foreign key constraint"],a:"`barcode` (a stable business key)",
  e:"DB ids are local to one service's database. A stable business key like a barcode survives the split (often with a duplicated name field)."},
 {t:"mc",topic:"Micro",q:"For service-to-service HTTP calls the course uses:",
  o:["`RestTemplate`","`WebClient`","`HttpURLConnection`","`Feign`"],a:"`WebClient`",
  e:"WebClient is the non-blocking client used in the course, registered as a singleton @Bean."},
 {t:"fill",topic:"Micro",q:"The `WebClient` is registered as a singleton `@______`, selected for injection with `@______`, and its target URL comes from an ______ variable. (annotation, annotation, word)",
  accept:["bean qualifier environment","Bean Qualifier environment"],e:"@Bean defines it once; @Qualifier picks the right one when several exist; the URL is externalised as an environment variable."},
 {t:"multi",topic:"Micro",q:"An API Gateway Route is defined by which of these parts? (choose all)",
  o:["an ID","a URI","predicates","filters","a discriminator column"],a:["an ID","a URI","predicates","filters"],
  e:"A route = id + uri + predicates (match conditions) + filters (transform). Discriminator columns belong to JPA inheritance, not gateways."},
 {t:"mc",topic:"Micro",q:"Across two microservices an order spans two databases. You typically rely on:",
  o:["one big ACID transaction across both","eventual consistency","a shared table","disabling transactions"],a:"eventual consistency",
  e:"A single ACID transaction can't span service databases; microservices accept eventual consistency between bounded contexts."},
 {t:"mc",topic:"Micro",q:"Why externalise the gateway and service URLs into environment variables / Docker Compose rather than hard-coding them?",
  o:["it's faster at runtime","so the same image runs in dev/test/prod without recompiling","JPA requires it","to enable lazy loading"],a:"so the same image runs in dev/test/prod without recompiling",
  e:"Dynamic configuration via env vars makes a build production-ready and portable across environments."},

 // ---- Topic 8: Security & IAM ----
 {t:"mc",topic:"Security",q:"OAuth 2.0 is fundamentally a framework for:",
  o:["authentication (who you are)","authorization (what you may access)","encryption at rest","logging"],a:"authorization (what you may access)",
  e:"OAuth 2.0 delegates authorization (access). Proving identity is layered on top by OpenID Connect."},
 {t:"mc",topic:"Security",q:"Which standard builds ON TOP of OAuth 2.0 to add authentication / identity?",
  o:["SAML","plain JWT","OpenID Connect","LDAP"],a:"OpenID Connect",
  e:"OpenID Connect adds an identity layer (the ID token) over OAuth 2.0's authorization."},
 {t:"fill",topic:"Security",q:"A JWT has three dot-separated parts: ______ . ______ . ______ (three words).",
  accept:["header payload signature"],e:"header.payload.signature — the signature lets the receiver verify the token wasn't tampered with."},
 {t:"mc",topic:"Security",q:"SAML 2.0 enables single sign-on with an external identity provider using:",
  o:["JSON tokens","XML-based assertions","raw cookies","API keys"],a:"XML-based assertions",
  e:"SAML exchanges XML assertions between the service provider and an external IdP for SSO."},
 {t:"mc",topic:"Security",q:"In a Spring Security + JWT setup, who validates the token's signature on each request?",
  o:["the browser","the resource server / API receiving the request","the database","the gateway only, never the service"],a:"the resource server / API receiving the request",
  e:"The API that receives the bearer token verifies its signature and claims before granting access — no session needed."},
 {t:"mc",topic:"Security",q:"The OAuth 2.0 Resource Owner Password flow is characterised by the user:",
  o:["never sharing credentials with the client","giving their username/password directly to the client app","using only a refresh token","authenticating via SAML"],a:"giving their username/password directly to the client app",
  e:"In the password grant the client handles the user's credentials directly — only acceptable for highly trusted first-party clients."},
],

/* ---------- CHALLENGING POOL (2 pts each) ---------- */
challenging: [
 {t:"mc",topic:"Arch",q:"A POST creates a resource and the service returns it, but clients always see HTTP 200 instead of 201. The most likely cause is:",
  o:["the entity has no @Id","the controller returns the DTO directly instead of `ResponseEntity.status(CREATED).body(...)`","the repository is missing","JPQL is case-sensitive"],a:"the controller returns the DTO directly instead of `ResponseEntity.status(CREATED).body(...)`",
  e:"Returning a plain object defaults to 200. To send 201 you must build a ResponseEntity with the CREATED status."},
 {t:"multi",topic:"Arch",q:"Which symptoms point to a LAYERING violation in this architecture? (choose all)",
  o:["The controller contains the discount calculation","The repository builds DTOs","The entity calls the email service","The service calls the repository"],a:["The controller contains the discount calculation","The repository builds DTOs","The entity calls the email service"],
  e:"Business logic belongs in the service; repositories only persist; entities are dumb data. Service→repository is the correct dependency."},
 {t:"mc",topic:"Inherit",q:"With SINGLE_TABLE inheritance, a column belonging only to subclass `Truck` must be:",
  o:["NOT NULL","nullable, because Car rows leave it empty","stored in a separate table","a discriminator"],a:"nullable, because Car rows leave it empty",
  e:"All subclasses share one table, so subclass-specific columns are null for the other types — they can't be NOT NULL."},
 {t:"mc",topic:"Assoc",q:"You set the @ManyToOne on OrderedItem but forget to add the item to `order.getItems()`. After saving, in the SAME transaction `order.getItems()` is empty. Why?",
  o:["JPA is broken","you must keep BOTH sides of a bidirectional association consistent yourself","mappedBy is wrong","the cascade is missing"],a:"you must keep BOTH sides of a bidirectional association consistent yourself",
  e:"JPA only persists the owning (FK) side; the in-memory inverse collection isn't auto-synced. Use a helper method to set both sides."},
 {t:"multi",topic:"Assoc",q:"A response DTO for an Order should generally include which, to stay clean? (choose all)",
  o:["the order id and total","a flat list of item names/quantities","the full managed OrderedItem entities","the Hibernate session"],a:["the order id and total","a flat list of item names/quantities"],
  e:"DTOs carry plain, serialization-safe data. Exposing managed entities re-introduces lazy-loading and recursion problems."},
 {t:"mc",topic:"Test",q:"A controller method declares `throws ResourceNotFoundException`. In a MockMvc integration test you expect:",
  o:["the test to crash","to assert the response status (e.g. 404) the exception handler maps it to","a NullPointerException","nothing — exceptions can't be tested"],a:"to assert the response status (e.g. 404) the exception handler maps it to",
  e:"You drive the request with MockMvc and assert the HTTP status produced by the @ExceptionHandler/@ControllerAdvice mapping."},
 {t:"mc",topic:"Test",q:"You stub `when(repo.save(any())).thenReturn(saved)` but the test fails because save is never matched. The likely fix:",
  o:["use a real database","the production code passes null where a matcher expected a value — align the matcher/argument","add @Autowired","remove the stub"],a:"the production code passes null where a matcher expected a value — align the matcher/argument",
  e:"Mockito matches the stub by argument matcher; a mismatch (e.g. wrong type or unexpected null) means the stub returns the default null instead."},
 {t:"mc",topic:"SOLID",q:"A `ReportGenerator` reads a file, computes stats AND emails the result. The smell and the fix are:",
  o:["OCP violation; add a switch","SRP violation; split into reader, calculator and notifier collaborators","LSP violation; use inheritance","no problem"],a:"SRP violation; split into reader, calculator and notifier collaborators",
  e:"Three reasons to change in one class = Single Responsibility violation. Separate the concerns into focused classes."},
 {t:"mc",topic:"Patterns",q:"You need to add logging, then compression, then encryption to a data stream — combinable in any order at runtime. The fitting pattern is:",
  o:["Singleton","Strategy","Decorator (stackable wrappers)","Observer"],a:"Decorator (stackable wrappers)",
  e:"Decorators wrap one another, each adding a responsibility, so behaviours stack in any combination without subclass explosion."},
 {t:"multi",topic:"Patterns",q:"Which statements about Singleton are TRUE? (choose all)",
  o:["The constructor is private","Access is via a static method","It is a behavioural pattern","It provides a single global instance"],a:["The constructor is private","Access is via a static method","It provides a single global instance"],
  e:"Singleton is CREATIONAL, not behavioural. Private constructor + static getInstance() + one shared instance are its defining traits."},
 {t:"mc",topic:"Micro",q:"After the split, the Order service needs the menu item's name on its receipts. The course's pragmatic approach is to:",
  o:["call the MenuItem service on every receipt render","duplicate `menuItemName` alongside the `barcode` in the Order data","share the MenuItem table","use a foreign key across databases"],a:"duplicate `menuItemName` alongside the `barcode` in the Order data",
  e:"Some controlled data duplication avoids a cross-service call per read and survives the bounded-context split; the barcode stays the link."},
 {t:"multi",topic:"Micro",q:"An API Gateway in front of the services can provide which cross-cutting concerns? (choose all)",
  o:["routing","central security/auth","monitoring","the JPA mappings"],a:["routing","central security/auth","monitoring"],
  e:"Gateways centralise routing, security, monitoring, canarying, resiliency and shielding. JPA mappings live inside each service."},
 {t:"mc",topic:"Security",q:"A client presents an expired JWT to your Spring Security API. The correct behaviour is:",
  o:["accept it — it was valid once","reject with 401; the signature/exp claim fails validation","look it up in the session table","refresh it automatically server-side without the client"],a:"reject with 401; the signature/exp claim fails validation",
  e:"JWTs are self-contained and validated per request; an expired `exp` claim fails validation → 401 Unauthorized."},
 {t:"mc",topic:"Inherit",q:"You filter and group 10,000 orders by status in Java streams instead of the DB. Performance is poor mainly because:",
  o:["streams are single-threaded","all 10,000 rows are fetched and held in memory before filtering","lambdas are slow","the GC is disabled"],a:"all 10,000 rows are fetched and held in memory before filtering",
  e:"The DB could filter/aggregate and return only the result; doing it in-memory transfers and holds the whole dataset first."},
],

/* ---------- ESSAY POOL ---------- */
/* Java theory exam is MC / multiple-answer / fill — no essays. */
essay: []
};

/* ============================================================
   COMPLETE QUIZ COLLECTION (from complete_quiz_collection_by_chapter.pdf)
   93 single-answer questions across all 6 chapters, tagged "Collection".
   Surfaced as ONE quiz (id "collection") below; kept out of the other
   Java papers via topic scoping.
   ============================================================ */
const QUIZ_PDF_QUESTIONS = [
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the primary benefit of using a repository pattern in JPA?",
  "o": [
   "Decoupling of business logic from data access logic",
   "Reduced database traffic",
   "Simplified entity instance management",
   "Improved data consistency",
   "Improved query performance"
  ],
  "a": "Decoupling of business logic from data access logic",
  "e": "The repository sits between business logic and persistence, so each can change independently."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the main challenge of the impedance mismatch between the object-oriented world of Java and the relational world of databases?",
  "o": [
   "The difference in programming paradigms between OO and Procedural Programming.",
   "The difference in data structures between OO and relational databases.",
   "The difference in scalability between Java and relational",
   "The difference in data types between Java and SQL"
  ],
  "a": "The difference in data structures between OO and relational databases.",
  "e": "Objects (graphs, inheritance) don't map cleanly onto tables/rows — that's the object–relational impedance mismatch."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is a functional interface?",
  "o": [
   "An interface with only one method",
   "An interface that needs to be implemented by a functional class",
   "An interface that contains a lambda expression",
   "An interface that contains functions instead of methods"
  ],
  "a": "An interface with only one method",
  "e": "Exactly one abstract method (SAM) — that's what lets a lambda implement it."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "Given the next functional interface, what needs to be on the ?",
  "code": "? <LocalDate> integerLambda = () -> LocalDate.now();",
  "o": [
   "Supplier",
   "Predicate",
   "Consumer",
   "Function"
  ],
  "a": "Supplier",
  "e": "No input, returns a value → Supplier<T> (T get())."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "A stream …",
  "o": [
   "has to be externally iterated using loops",
   "is a collection",
   "is not modifiable",
   "stores data"
  ],
  "a": "is not modifiable",
  "e": "A stream doesn't store data and can't be modified; it's a pipeline that's internally iterated."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "Given the next functional interface, what can you fill in at the ?",
  "code": "Function<Integer, String> function = i -> ? ;",
  "o": [
   "i.toString();",
   "none of these",
   "Integer.valueOf(i)",
   "i+1;"
  ],
  "a": "i.toString();",
  "e": "Function<Integer,String> takes an Integer and must return a String → i.toString()."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the purpose of the @Entity annotation in JPA?",
  "o": [
   "To specify the primary key of an entity",
   "To define a many-to-one relationship between entities",
   "To indicate that a class is an entity and should be managed by the JPA provider",
   "To specify the database schema for an entity",
   "To define a database table and its columns"
  ],
  "a": "To indicate that a class is an entity and should be managed by the JPA provider",
  "e": "@Entity marks a class as a persistent entity managed by the JPA provider."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the primary purpose of the @Autowired annotation in Spring Boot?",
  "o": [
   "To enable Spring Data JPA auto-configuration",
   "To enable Spring Boot's auto-configuration features",
   "To inject a dependency into a class",
   "To enable JPA auto-configuration"
  ],
  "a": "To inject a dependency into a class",
  "e": "@Autowired tells Spring to inject a matching bean (dependency injection)."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "Suppose you want to add a new Object with a POST Request. What is the best way to pass this to your REST service?",
  "o": [
   "Path variable",
   "It is not possible to add an object to a POST Request",
   "Query parameter",
   "JSON Request Body"
  ],
  "a": "JSON Request Body",
  "e": "A full object goes in the request body as JSON (@RequestBody)."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "1 = .filter(Predicate) and 2 = .findFirst()",
  "o": [
   "1 = an intermediate operation and 2 = a terminal operation",
   "1 = a terminal operation and 2 = intermediate operation",
   "both are intermediate operations",
   "both are terminal operations"
  ],
  "a": "1 = an intermediate operation and 2 = a terminal operation",
  "e": "filter() returns a stream (intermediate, lazy); findFirst() ends the pipeline (terminal)."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "REST stands for …",
  "o": [
   "Resident Evil State Transfer",
   "Nothing, the inventor was resting at that time.",
   "Representational State Transfer",
   "Representational Enhanced State Transfer"
  ],
  "a": "Representational State Transfer",
  "e": "REpresentational State Transfer."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "Given the next functional interface, what needs to be on the ?",
  "code": "Predicate<?> function = i -> i.contains(\"T\");",
  "o": [
   "Function",
   "Integer",
   "String",
   "Boolean"
  ],
  "a": "String",
  "e": ".contains(\"T\") is a String method, so the input type is String (Predicate<String>)."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the primary purpose of the @Id annotation in JPA?",
  "o": [
   "To define the primary key of an entity (PK)",
   "To define a Java class as an entity",
   "To define a relationship between entities (FK)",
   "To define a database table"
  ],
  "a": "To define the primary key of an entity (PK)",
  "e": "@Id marks the field used as the entity's primary key."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "Given the next functional interface, what needs to be on the ?",
  "code": "? <Integer> integerLambda = i -> System.out.println(i);",
  "o": [
   "Predicate",
   "Function",
   "Supplier",
   "Consumer"
  ],
  "a": "Consumer",
  "e": "Takes an input, returns nothing (side effect only) → Consumer<T> (void accept(T))."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "GET, POST, PUT en REMOVE are the 4 most used HTTP request methods.",
  "o": [
   "True",
   "False"
  ],
  "a": "False",
  "e": "The four are GET, POST, PUT and DELETE — there is no REMOVE method."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What happens when CascadeType.REMOVE is applied to a relationship?",
  "o": [
   "The database prevents deletion of the parent if child entities exist",
   "Deleting the parent entity also deletes all related child entities",
   "Child entities are detached from the parent but remain in the database",
   "The parent entity is deleted, but child entities remain"
  ],
  "a": "Deleting the parent entity also deletes all related child entities",
  "e": "REMOVE cascades the delete from parent to its children."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is an advantage of the Table Per Class Strategy?",
  "o": [
   "No data redundancy",
   "It is the most normalized structure",
   "No null values or discriminator columns",
   "Queries are always faster"
  ],
  "a": "No null values or discriminator columns",
  "e": "Each concrete class has its own complete table, so no nullable/discriminator columns — but inherited columns are duplicated."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What does the orphanRemoval = true attribute do in a OneToMany relationship?",
  "o": [
   "Ignores updates to the relationship",
   "Ensures that child entities are deleted when removed from the collection",
   "Prevents child entities from being deleted",
   "Automatically detaches child entities from the persistence context"
  ],
  "a": "Ensures that child entities are deleted when removed from the collection",
  "e": "A child removed from the parent's collection becomes an orphan and is deleted."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "Which annotation(s) should be used? Diagram: Book (1) ──► Rating (*) — one Book has many Ratings.",
  "o": [
   "1 annotation in Book: @ManyToOne Rating AND 1 annotation in Rating: @OneToMany List<Book> books",
   "1 annotation in Book: @OneToMany List<Rating> ratings AND 1 annotation in Rating: @ManyToOne Book",
   "1 annotation in Book: @ManyToOne Rating",
   "1 annotation in Book: @OneToMany List<Rating> ratings"
  ],
  "a": "1 annotation in Book: @OneToMany List<Rating> ratings",
  "e": "Unidirectional 1→*: the owning 'one' side (Book) gets @OneToMany List<Rating>."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What does the @MappedSuperclass annotation do?",
  "o": [
   "Allows a superclass to provide fields to subclasses without creating a table",
   "Creates a separate table for the superclass",
   "Enables polymorphic queries",
   "Defines a foreign key relationship"
  ],
  "a": "Allows a superclass to provide fields to subclasses without creating a table",
  "e": "Its fields are inherited into each subclass table; the superclass itself has no table and isn't an entity."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "Which annotation should you use when you do NOT want to save an attribute of an entity to the database?",
  "o": [
   "@Embeddable",
   "@Embedded",
   "@Transient",
   "@Temporal"
  ],
  "a": "@Transient",
  "e": "@Transient excludes a field from persistence."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "Inheritance strategy: each class (Person, Customer, Employee, Executive) has its OWN table holding only its own fields + id, joined back to Person. Which strategy?",
  "o": [
   "MULTIPLE_TABLE",
   "TABLE_PER_CLASS",
   "SINGLE_TABLE",
   "JOINED"
  ],
  "a": "JOINED",
  "e": "JOINED keeps a table per class with shared columns in the parent table, linked by joins on the id."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the main downside of FetchType.EAGER?",
  "o": [
   "It can degrade performance by fetching unnecessary data",
   "It does not work with @ManyToOne relationships",
   "It leads to data loss when entities are removed",
   "It requires multiple queries to retrieve related entities"
  ],
  "a": "It can degrade performance by fetching unnecessary data",
  "e": "EAGER always loads associations even when unused, hurting performance; LAZY loads on demand."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "In which entity should you put the \"mappedBy\" attribute? Diagram: Human (1) ──── Animal (*) — a one-to-many association.",
  "o": [
   "Nowhere. This is not necessary in a 1 to * association",
   "Human",
   "Animal",
   "You can choose: Human or Animal"
  ],
  "a": "Human",
  "e": "In a bidirectional 1→*, mappedBy goes on the 'one' (non-owning) side — Human."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "Which annotation(s) should be used? Diagram: Book (*) ──► Rating (1) — many Books map to one Rating.",
  "o": [
   "1 annotation in Book: @OneToMany List<Rating> ratings AND 1 annotation in Rating: @ManyToOne Book",
   "1 annotation in Book: @OneToMany List<Rating> ratings",
   "1 annotation in Book: @ManyToOne Rating AND 1 annotation in Rating: @OneToMany List<Book> books",
   "1 annotation in Book: @ManyToOne Rating"
  ],
  "a": "1 annotation in Book: @ManyToOne Rating",
  "e": "Unidirectional *→1: the 'many' side (Book) gets @ManyToOne Rating."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the purpose of the cascade attribute in a JPA relationship?",
  "o": [
   "It defines the primary key of the entity",
   "It specifies how entities are stored in the database",
   "It ensures that relationships are always bidirectional",
   "It determines how operations on a parent entity affect child entities"
  ],
  "a": "It determines how operations on a parent entity affect child entities",
  "e": "cascade controls which operations (persist, remove, …) propagate from parent to children."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "Inheritance strategy: every concrete table (Customer, Employee, Executive) repeats ALL inherited columns (id, name, …) and there is no shared parent table. Which strategy?",
  "o": [
   "MULTIPLE_TABLE",
   "TABLE_PER_CLASS",
   "SINGLE_TABLE",
   "JOINED"
  ],
  "a": "TABLE_PER_CLASS",
  "e": "TABLE_PER_CLASS gives each concrete class a full standalone table (inherited columns duplicated)."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "Which of the following best describes polymorphic queries in JPA?",
  "o": [
   "Queries that return only instances of one specific subclass",
   "Queries that require multiple joins to work",
   "Queries that return instances of all subclasses from the superclass type",
   "Queries that return only instances of the superclass"
  ],
  "a": "Queries that return instances of all subclasses from the superclass type",
  "e": "Querying the superclass type returns all matching subclass instances."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "In which entity should you put the \"mappedBy\" attribute? Diagram: Human (1) ──── Animal (1) — a one-to-one association.",
  "o": [
   "Human AND Animal",
   "You can choose: Human OR Animal",
   "Human",
   "Nowhere. This is not necessary in a 1 to 1 association."
  ],
  "a": "You can choose: Human OR Animal",
  "e": "In a 1:1, either side may own the relationship — you can put mappedBy on whichever you choose."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "Why is a checked exception called checked?",
  "o": [
   "Because you need to check the exception and handle it as programmer.",
   "Because from the moment you handled an exception as a programmer, we call that exception checked.",
   "Because the exception is automatically checked by the compiler and you are forced to handle it.",
   "Because the exception is automatically checked by the compiler and you don't need to worry about it."
  ],
  "a": "Because the exception is automatically checked by the compiler and you are forced to handle it.",
  "e": "The compiler enforces handling (catch or declare) of checked exceptions."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the difference between HTTP 4xx errors and HTTP 5xx errors?",
  "o": [
   "HTTP 4xx errors indicate client-side errors, while HTTP 5xx errors indicate server-side errors.",
   "HTTP 4xx errors indicate user errors, while HTTP 5xx errors indicate programming errors.",
   "HTTP 4xx errors indicate programming errors, while HTTP 5xx errors indicate user errors.",
   "HTTP 4xx errors indicate server-side errors, while HTTP 5xx errors indicate client-side errors."
  ],
  "a": "HTTP 4xx errors indicate client-side errors, while HTTP 5xx errors indicate server-side errors.",
  "e": "4xx = client's fault (e.g. 404), 5xx = server's fault (e.g. 500)."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the purpose of the @ResponseStatus annotation in a custom exception class?",
  "o": [
   "To specify the exception handler that will respond to the exception.",
   "To specify the exception status type for the exception.",
   "To specify the HTTP code for the exception.",
   "To specify the error status message for the exception."
  ],
  "a": "To specify the HTTP code for the exception.",
  "e": "@ResponseStatus maps the exception to a specific HTTP status code."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the purpose of the SAML 2.0 Assertion flow in IAM?",
  "o": [
   "To enable a client app to obtain an authorization from an Identity Provider and exchange it for an OAuth access token or ID token.",
   "To store user information in the token.",
   "To manage user permissions and access control more accurately than other flows.",
   "To prompt the user to enter credentials at the Authorization server."
  ],
  "a": "To enable a client app to obtain an authorization from an Identity Provider and exchange it for an OAuth access token or ID token.",
  "e": "SAML assertion bridges an IdP login into an OAuth access/ID token."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the \"sub\" claim in a token used for?",
  "o": [
   "To provide a unique identifier for the token.",
   "To identify the entity that issued the token.",
   "To identify the subject of the JWT, which is the entity that the token is about.",
   "To specify the time after which the token is no longer valid."
  ],
  "a": "To identify the subject of the JWT, which is the entity that the token is about.",
  "e": "sub = subject: who/what the token is about. (iss = issuer, exp = expiry.)"
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the purpose of the try-with-resources statement in Java?",
  "o": [
   "To automatically close resources when done.",
   "To declare that a method may throw an exception while using resources.",
   "To be able to ignore exceptions when using resources.",
   "To use a try-catch block that contains resources."
  ],
  "a": "To automatically close resources when done.",
  "e": "Resources opened in try(...) are auto-closed (AutoCloseable)."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "In the Resource Owner Password Flow, which condition must be met for this flow to be appropriate?",
  "o": [
   "The client application must be trusted with the resource owner's credentials.",
   "The client application must be a third-party application.",
   "The client application must support multifactor authentication.",
   "The client application must use redirects for authentication."
  ],
  "a": "The client application must be trusted with the resource owner's credentials.",
  "e": "The user hands their password to the app, so it must be fully trusted (first-party)."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the purpose of the throws keyword in Java?",
  "o": [
   "To throw multiple exceptions at the same time.",
   "To ignore exceptions.",
   "To throw exceptions.",
   "To declare that a method may throw one or more exceptions."
  ],
  "a": "To declare that a method may throw one or more exceptions.",
  "e": "throws declares exceptions a method may propagate; throw actually raises one."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the difference between an exception and an error in Java?",
  "o": [
   "An exception is a minor problem, while an error is serious.",
   "An exception is a serious problem, while an error is not.",
   "An exception is a problem that can be caught and handled, while an error is not.",
   "An exception is a problem that can be ignored, while an error is not."
  ],
  "a": "An exception is a problem that can be caught and handled, while an error is not.",
  "e": "Errors (e.g. OutOfMemoryError) signal serious JVM problems you normally shouldn't catch."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "Which statement is true about the relationship between authentication and authorization in IAM?",
  "o": [
   "Authentication is a process that occurs after authorization has been granted.",
   "Authorization is a process that occurs independently of authentication.",
   "Authentication is a one-time process, while authorization is an ongoing process.",
   "Authentication verifies the identity of a user, while authorization verifies the permissions of a user."
  ],
  "a": "Authentication verifies the identity of a user, while authorization verifies the permissions of a user.",
  "e": "AuthN = who you are; AuthZ = what you're allowed to do."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "Which scenario would most likely result in an unchecked exception?",
  "o": [
   "Failing to close a database connection.",
   "Running out of memory while creating a large array.",
   "Dividing an integer by zero.",
   "Attempting to read a file that does not exist."
  ],
  "a": "Dividing an integer by zero.",
  "e": "ArithmeticException is a RuntimeException (unchecked). File/IO cases are checked."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "Which entity is responsible for granting permissions to a protected resource in the OAuth 2.0 Resource Owner Password flow?",
  "o": [
   "Resource server.",
   "Authorization server.",
   "Resource owner.",
   "Client application."
  ],
  "a": "Resource owner.",
  "e": "The resource owner (the user) owns the resource and grants access to it."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the primary purpose of the DefaultHandlerExceptionResolver in the Spring Framework?",
  "o": [
   "To replace the need for custom exception handlers.",
   "To prevent unchecked exceptions from being thrown in a Spring application.",
   "To resolve specific exceptions thrown during request processing and return appropriate HTTP status codes.",
   "To catch and handle all exceptions, including custom exceptions, by default."
  ],
  "a": "To resolve specific exceptions thrown during request processing and return appropriate HTTP status codes.",
  "e": "It maps standard Spring MVC exceptions to sensible HTTP status codes."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the purpose of the JWS signature in a JWT?",
  "o": [
   "To store the token's expiration date and other details.",
   "To encrypt the token's contents.",
   "To provide additional context and information about the user.",
   "To verify that the sender of the JWT is who it says it is and to ensure that the message wasn't changed along the way."
  ],
  "a": "To verify that the sender of the JWT is who it says it is and to ensure that the message wasn't changed along the way.",
  "e": "JWS gives authenticity + integrity (not confidentiality — the payload isn't encrypted)."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the primary purpose of OAuth 2.0 instead of older systems in the context of IAM?",
  "o": [
   "To provide a single sign-on solution for users.",
   "To authenticate and authorize users for access to resources more efficiently.",
   "To manage user identities and permissions.",
   "To provide secure access to resources without sharing user credentials."
  ],
  "a": "To provide secure access to resources without sharing user credentials.",
  "e": "OAuth delegates access via tokens so the user's password is never shared with the client."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the primary purpose of stubbing and mocking in unit testing?",
  "o": [
   "To reduce testing time",
   "To isolate dependencies and test individual components",
   "To test the entire application at once",
   "To improve code coverage",
   "To increase code complexity"
  ],
  "a": "To isolate dependencies and test individual components",
  "e": "Mocks/stubs replace real dependencies so a unit is tested in isolation."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the purpose of the @Mock annotation in Mockito?",
  "o": [
   "To create a mock object",
   "To verify that a method is called",
   "To create a stub object",
   "To create a test class",
   "To inject a dependency"
  ],
  "a": "To create a mock object",
  "e": "@Mock creates a Mockito mock of the annotated type."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the primary goal of unit testing in software development?",
  "o": [
   "To test the integration of different modules.",
   "To isolate and verify the functionality of individual units of code.",
   "To ensure the entire application works as expected.",
   "To test the user interface of the application."
  ],
  "a": "To isolate and verify the functionality of individual units of code.",
  "e": "Unit tests check one small unit (e.g. a method) in isolation."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the primary benefit of integrating unit tests into a Continuous Integration (CI) pipeline?",
  "o": [
   "To increase the time it takes to release software.",
   "To reduce the frequency of testing.",
   "To deploy code to production without testing.",
   "To manually run tests after each code change.",
   "To automate the execution of tests and provide early feedback on code quality."
  ],
  "a": "To automate the execution of tests and provide early feedback on code quality.",
  "e": "CI runs tests automatically on every change, catching regressions early."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the primary goal of software testing?",
  "o": [
   "To ensure the software meets the requirements and works as expected",
   "To improve the performance of the software",
   "To reduce the cost of software development",
   "To increase the complexity of the software",
   "To identify and fix bugs in the software"
  ],
  "a": "To ensure the software meets the requirements and works as expected",
  "e": "Testing validates the software does what it's supposed to."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the primary benefit of the test automation pyramid?",
  "o": [
   "To reduce the cost of software development",
   "To reduce the time and effort required for testing",
   "To ensure the software is maintainable and scalable",
   "To improve the performance of the software",
   "To ensure the software meets the requirements"
  ],
  "a": "To reduce the time and effort required for testing",
  "e": "Lots of fast unit tests at the base, few slow E2E tests at the top → efficient testing."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the focus of integration testing?",
  "o": [
   "Testing the entire system",
   "Testing the user interface",
   "Testing the interaction between multiple components",
   "Testing individual components in isolation"
  ],
  "a": "Testing the interaction between multiple components",
  "e": "Integration tests check that components work together correctly."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the test automation pyramid?",
  "o": [
   "A method for writing unit tests",
   "A tool for automating system tests",
   "A concept that categorizes tests into three levels: unit tests, integration tests, and end-to-end tests",
   "A framework for acceptance testing"
  ],
  "a": "A concept that categorizes tests into three levels: unit tests, integration tests, and end-to-end tests",
  "e": "Three layers: unit (base), integration (middle), end-to-end (top)."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "Which level of the test automation pyramid is the fastest and cheapest to run?",
  "o": [
   "System tests",
   "Unit tests",
   "Integration tests",
   "End-to-end tests"
  ],
  "a": "Unit tests",
  "e": "Unit tests are small, isolated and fast — the cheap base of the pyramid."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is Test-Driven Development (TDD)?",
  "o": [
   "A tool for automating unit tests",
   "A method for writing integration tests",
   "A software development methodology where tests are written before the code",
   "A software development methodology where tests are written after the code"
  ],
  "a": "A software development methodology where tests are written before the code",
  "e": "In TDD you write a failing test first, then code to make it pass."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the first step in the TDD cycle?",
  "o": [
   "Write a test",
   "Run the test",
   "Refactor",
   "Write code"
  ],
  "a": "Write a test",
  "e": "Red-Green-Refactor begins by writing a (failing) test."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What does the \"Red\" phase in TDD represent?",
  "o": [
   "Refactoring the code",
   "Writing a passing test",
   "Writing a failing test",
   "Running the test"
  ],
  "a": "Writing a failing test",
  "e": "Red = a failing test; Green = make it pass; then Refactor."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "Which phase in the TDD cycle involves cleaning up the code?",
  "o": [
   "Refactor",
   "Run the test",
   "Write a test",
   "Write code"
  ],
  "a": "Refactor",
  "e": "Refactor improves the code while keeping tests green."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is NOT a good feature of a unit test?",
  "o": [
   "Readable",
   "Dependent on other tests",
   "Quick",
   "Consistent"
  ],
  "a": "Dependent on other tests",
  "e": "Good unit tests are independent — order/other tests shouldn't affect them (FIRST principles)."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is NOT a feature of an integration test?",
  "o": [
   "More complex than a unit test",
   "More difficult to maintain than a unit test",
   "Slower than a unit test",
   "More difficult to map to a user story than a unit test"
  ],
  "a": "More difficult to map to a user story than a unit test",
  "e": "Integration tests actually map to user stories more easily than isolated unit tests."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the primary benefit of following SOLID principles?",
  "o": [
   "Reduces runtime errors",
   "Ensures maintainable, scalable, and robust software",
   "Increases performance at runtime",
   "Makes code shorter"
  ],
  "a": "Ensures maintainable, scalable, and robust software",
  "e": "SOLID targets design quality — maintainability and flexibility, not raw performance."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What does the Single Responsibility Principle (SRP) state?",
  "o": [
   "A class should only contain primitive data types",
   "A class should have only one method",
   "A class should handle multiple responsibilities",
   "A class should only handle one specific responsibility"
  ],
  "a": "A class should only handle one specific responsibility",
  "e": "One class, one reason to change."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "Which of the following is an example of violating SRP?",
  "o": [
   "A class that retrieves user data",
   "A class that only manages database connections",
   "A class that only handles authentication",
   "A class that both logs user actions and processes payments"
  ],
  "a": "A class that both logs user actions and processes payments",
  "e": "Two unrelated responsibilities (logging + payments) in one class violates SRP."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "How can SRP violations be fixed?",
  "o": [
   "By adding more methods to a single class",
   "By replacing all classes with one large function",
   "By merging all responsibilities into one class",
   "By splitting responsibilities into separate, focused classes"
  ],
  "a": "By splitting responsibilities into separate, focused classes",
  "e": "Extract each responsibility into its own focused class."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What does the Open/Closed Principle (OCP) state?",
  "o": [
   "Classes should be closed for modification but open for extension",
   "Classes should not be modified or extended",
   "Classes should not be extended under any circumstances",
   "Classes should be open for modification and closed for extension"
  ],
  "a": "Classes should be closed for modification but open for extension",
  "e": "Add behaviour by extending, not by editing existing tested code."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is a violation of OCP?",
  "o": [
   "Extending a class using inheritance",
   "Modifying an existing class every time new functionality is needed",
   "Adding a new class to extend functionality",
   "Using dependency injection"
  ],
  "a": "Modifying an existing class every time new functionality is needed",
  "e": "Editing existing code for every new feature breaks 'closed for modification'."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the main idea of the Liskov Substitution Principle (LSP)?",
  "o": [
   "A subclass should always add new methods to a superclass",
   "A subclass should not inherit from another class",
   "A subclass should never override methods of a superclass",
   "A subclass should be able to replace its superclass without affecting correctness"
  ],
  "a": "A subclass should be able to replace its superclass without affecting correctness",
  "e": "Subtypes must be usable anywhere their base type is, without breaking behaviour."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "Which of the following violates LSP?",
  "o": [
   "A subclass that follows the interface contract",
   "A subclass that extends an abstract class and implements required methods",
   "A subclass that cannot replace its parent class without breaking functionality",
   "A subclass that overrides a method but maintains expected behavior"
  ],
  "a": "A subclass that cannot replace its parent class without breaking functionality",
  "e": "If substituting the subclass breaks the program, LSP is violated."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What does the Interface Segregation Principle (ISP) state?",
  "o": [
   "A client should not be forced to implement methods of an interface that it does not use.",
   "Interfaces should be large and all-encompassing",
   "A single interface should contain all possible methods",
   "One large interface is better than multiple small ones"
  ],
  "a": "A client should not be forced to implement methods of an interface that it does not use.",
  "e": "Prefer many small, focused interfaces over one fat interface."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "How can ISP be violated?",
  "o": [
   "By using dependency injection",
   "By applying the Open/Closed Principle",
   "By making an interface too broad, forcing classes to implement unused methods",
   "By creating small, focused interfaces"
  ],
  "a": "By making an interface too broad, forcing classes to implement unused methods",
  "e": "Fat interfaces force implementers to stub methods they don't need."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What does the Dependency Inversion Principle (DIP) state?",
  "o": [
   "High-level modules should not depend on low-level modules, but on abstractions",
   "High-level modules should depend on low-level modules",
   "Abstractions should depend on details",
   "Code should directly depend on concrete implementations"
  ],
  "a": "High-level modules should not depend on low-level modules, but on abstractions",
  "e": "Both high- and low-level modules depend on abstractions, not on each other."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is a code smell?",
  "o": [
   "A performance optimization",
   "A minor issue in the code that does not affect maintainability",
   "A required part of SOLID-compliant code",
   "An indicator of potential design problems in the code"
  ],
  "a": "An indicator of potential design problems in the code",
  "e": "A smell is a surface symptom hinting at a deeper design problem."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "Which of the following is a correct example of DIP?",
  "o": [
   "A service class tightly coupled with database logic",
   "A class depending on an interface rather than a concrete class",
   "A class directly instantiating another class",
   "A low-level module controlling a high-level module"
  ],
  "a": "A class depending on an interface rather than a concrete class",
  "e": "Depending on an abstraction (interface) instead of a concrete class realizes DIP."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "Which code smell often indicates a violation of SRP?",
  "o": [
   "Switch Statements",
   "Primitive Obsession",
   "Large Class",
   "Data Clumps"
  ],
  "a": "Large Class",
  "e": "A large class usually does too many things — an SRP violation."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the primary goal of refactoring?",
  "o": [
   "To improve code readability and maintainability without changing external behavior",
   "To replace all existing code with a new implementation",
   "To add new features",
   "To increase code execution speed"
  ],
  "a": "To improve code readability and maintainability without changing external behavior",
  "e": "Refactoring changes internal structure while keeping observable behaviour the same."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the primary purpose of design patterns in software engineering?",
  "o": [
   "To reduce code readability and maintainability.",
   "To automate the process of software testing and debugging.",
   "To provide reusable solutions to commonly occurring design problems",
   "To enforce strict coding standards across development teams.",
   "To eliminate the need for object-oriented programming principles.",
   "To increase the complexity of software systems."
  ],
  "a": "To provide reusable solutions to commonly occurring design problems",
  "e": "Patterns are proven, reusable solutions to recurring design problems."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is a potential drawback of using the Singleton pattern excessively?",
  "o": [
   "It simplifies dependency management in large projects.",
   "It encourages adherence to the Single Responsibility Principle.",
   "It promotes loose coupling between classes.",
   "It can introduce global state and make unit testing more difficult.",
   "It always improves code flexibility and maintainability.",
   "It completely eliminates the need for dependency injection."
  ],
  "a": "It can introduce global state and make unit testing more difficult.",
  "e": "Singletons act as hidden global state, which complicates isolation in tests."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the core principle behind the Observer pattern?",
  "o": [
   "Define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.",
   "Provide a way to access the elements of an aggregate object sequentially without exposing its underlying representation.",
   "Ensure that a class has only one instance.",
   "Define an interface for creating an object, but let subclasses decide which class to instantiate.",
   "Convert the interface of a class into another interface clients expect.",
   "Compose objects into tree structures to represent part-whole hierarchies."
  ],
  "a": "Define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.",
  "e": "One subject notifies many observers on state change."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What are the two primary components of the Observer pattern?",
  "o": [
   "Singleton and Observer",
   "Observer and Decorator",
   "Proxy and Observer",
   "Observer and Strategy",
   "Subject and Observer"
  ],
  "a": "Subject and Observer",
  "e": "The Subject holds state and notifies its Observers."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "In a UML class diagram representing the Observer pattern, what type of relationship exists between the Subject and Observer?",
  "o": [
   "Generalization",
   "Association",
   "Aggregation",
   "Dependency",
   "Composition",
   "Realization"
  ],
  "a": "Association",
  "e": "The Subject keeps a reference to its Observers — an association."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "How do the Singleton and Observer patterns differ in their primary purpose?",
  "o": [
   "Singleton is a creational pattern, while Observer is a structural pattern.",
   "Singleton is a behavioral pattern, while Observer is a creational pattern.",
   "Both patterns serve the same fundamental purpose.",
   "Singleton manages object interaction, while Observer manages object creation.",
   "Singleton manages object creation (one instance), while Observer manages object interaction (one-to-many dependencies).",
   "Both patterns are structural patterns."
  ],
  "a": "Singleton manages object creation (one instance), while Observer manages object interaction (one-to-many dependencies).",
  "e": "Singleton = creational (one instance); Observer = behavioural (object interaction)."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "When might you combine the Singleton and Observer patterns?",
  "o": [
   "When a single object needs to notify multiple observers about changes in its state.",
   "When you need to encapsulate a request as an object.",
   "When you need to create multiple instances of a class with different configurations.",
   "When you want to restrict access to a shared resource to a limited number of clients.",
   "When you want to decouple the sending of a request from its processing.",
   "When you need to implement a complex data structure with hierarchical relationships."
  ],
  "a": "When a single object needs to notify multiple observers about changes in its state.",
  "e": "A single (singleton) subject notifying many observers is a natural combination."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the primary purpose of the Strategy pattern?",
  "o": [
   "To provide a way to compose objects into a tree-like structure",
   "To provide a way to add new behavior to an object without modifying its structure",
   "To provide a way to define an interface for creating an object, but let subclasses decide which class to instantiate",
   "To provide a way to implement a one-to-many dependency between objects",
   "To define a family of algorithms, encapsulate each one as a separate class, and make them interchangeable at runtime"
  ],
  "a": "To define a family of algorithms, encapsulate each one as a separate class, and make them interchangeable at runtime",
  "e": "Strategy makes interchangeable algorithms selectable at runtime."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the Decorator pattern used for?",
  "o": [
   "To add new behavior to an object without modifying its structure",
   "To let subclasses decide which class to instantiate",
   "To define an interface for creating an object",
   "To implement a one-to-many dependency between objects",
   "To define a family of algorithms"
  ],
  "a": "To add new behavior to an object without modifying its structure",
  "e": "Decorator wraps an object to add behaviour dynamically."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "How does the Decorator pattern add new behavior to an object?",
  "o": [
   "By creating a new class that inherits from the original class",
   "By creating a new class that uses composition",
   "By creating a new class that contains an instance of the original class",
   "By creating a new class that extends the original class",
   "By creating a new class that implements an interface"
  ],
  "a": "By creating a new class that contains an instance of the original class",
  "e": "The decorator holds (wraps) an instance of the component — composition over inheritance."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the benefit of using the Strategy pattern?",
  "o": [
   "It allows for greater scalability and adaptability",
   "It allows for greater security and reliability",
   "It allows for greater performance and efficiency",
   "It allows for greater flexibility and extensibility in the design of a system",
   "It allows for greater usability and maintainability"
  ],
  "a": "It allows for greater flexibility and extensibility in the design of a system",
  "e": "New algorithms can be added without changing the client — flexible/extensible."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "Which of the following is a real-world application of the Strategy pattern?",
  "o": [
   "User authentication systems",
   "File storage systems",
   "Network communication protocols",
   "Payment processing systems with different payment methods."
  ],
  "a": "Payment processing systems with different payment methods.",
  "e": "Each payment method is an interchangeable strategy."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is a drawback of the Strategy pattern and the Decorator pattern?",
  "o": [
   "It can lead to over-engineering making the implementation very complex",
   "It reduces the flexibility of the system",
   "It eliminates the need for code reuse",
   "It simplifies the implementation for large systems"
  ],
  "a": "It can lead to over-engineering making the implementation very complex",
  "e": "Many small classes/wrappers can over-complicate the design."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the primary purpose of dynamic configuration in microservices?",
  "o": [
   "To hardcode service URLs for stability",
   "To externalize environment-specific settings from application code",
   "To increase application performance",
   "To reduce the number of configuration files"
  ],
  "a": "To externalize environment-specific settings from application code",
  "e": "Config lives outside the code so the same artifact runs in any environment."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "In the Spring Boot configuration below, what does it mean?",
  "code": "productservice.baseurl=${PRODUCT_SERVICE_BASE_URL:http://localhost:8081/api/products}",
  "o": [
   "It uses the PRODUCT_SERVICE_BASE_URL environment variable if set, otherwise falls back to http://localhost:8081/api/products",
   "It concatenates the environment variable with the hardcoded URL",
   "It requires both the environment variable and the hardcoded URL to be present",
   "It always uses http://localhost:8081/api/products regardless of environment variables"
  ],
  "a": "It uses the PRODUCT_SERVICE_BASE_URL environment variable if set, otherwise falls back to http://localhost:8081/api/products",
  "e": "${VAR:default} = use VAR if present, else the value after the colon."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the main advantage of using an API Gateway for security in a microservice architecture?",
  "o": [
   "It makes all microservices completely secure by default",
   "It removes the need for HTTPS encryption",
   "It eliminates the need for any security measures in individual microservices",
   "It centralizes authentication and authorization, reducing redundant code in microservices"
  ],
  "a": "It centralizes authentication and authorization, reducing redundant code in microservices",
  "e": "AuthN/AuthZ handled once at the gateway instead of duplicated per service."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "When using ArgumentCaptor to verify a WebClient call, what does the following code check?",
  "code": "verify(headersUriSpec).uri(uriFunctionCaptor.capture());\nURI uri = uriFunctionCaptor.getValue().apply(UriComponentsBuilder.newInstance());\nassertThat(uri.getQuery()).contains(\"barcode=BC1\");",
  "o": [
   "That the response contains a product with barcode BC1",
   "That the request headers included a BC1 authentication token",
   "That the WebClient call included BC1 as a query parameter",
   "That the database was updated with a product having barcode BC1"
  ],
  "a": "That the WebClient call included BC1 as a query parameter",
  "e": "It captures the URI function, builds the URI, and asserts the query string contains barcode=BC1."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the main advantage of using a prebuilt API Gateway like Kong compared to building a custom solution?",
  "o": [
   "Better performance in all use cases",
   "Faster deployment with out-of-the-box functionality",
   "No need for any configuration",
   "Complete control over all features and implementations"
  ],
  "a": "Faster deployment with out-of-the-box functionality",
  "e": "Kong ships ready-made features (auth, rate limiting, routing) so you deploy faster."
 },
 {
  "t": "mc",
  "topic": "Collection",
  "q": "What is the purpose of canary deployments in API Gateway configuration?",
  "o": [
   "To create multiple identical copies of the same service for redundancy",
   "To gradually roll out new versions to a small percentage of traffic while monitoring performance",
   "To gradually put new features of an application or architecture online",
   "To completely replace old services with new versions immediately"
  ],
  "a": "To gradually roll out new versions to a small percentage of traffic while monitoring performance",
  "e": "A canary sends a little traffic to the new version first, monitoring before full rollout."
 }
];
JAVA_BANK.standard.push(...QUIZ_PDF_QUESTIONS);


/* ============================================================
   QUIZZES — Java Development mock exams. Theory format only
   (MC / multi-answer / fill). Sized for the real 30–45 min slot.
   ============================================================ */
const JAVA_TOPIC_GROUPS = {
  PERSIST: ["Arch","Inherit","Assoc","Streams"],
  QUALITY: ["Test","SOLID","Patterns"],
  DISTRIB: ["Micro","Security"]
};
const JAVA_BASE = ["Arch","Inherit","Assoc","Streams","Test","SOLID","Patterns","Micro","Security"];
const JAVA_QUIZZES = [
  { id:"full",   title:"Java Mock Exam — Full (real format)",
    topics:JAVA_BASE, compose:{standard:30,challenging:6,essay:0},
    blurb:"~36 questions · 42 pts of MC, multiple-answer & fill-the-gap across all 8 topics. Sized for the 30–45 min theory slot." },
  { id:"quick",  title:"Java Mock — Quickfire 20",
    topics:JAVA_BASE, compose:{standard:20,challenging:0,essay:0},
    blurb:"A fast 20-question recall round across the whole course — great for a warm-up." },
  { id:"persist",title:"Java Mock — Persistence (JPA & Hibernate)",
    topics:JAVA_TOPIC_GROUPS.PERSIST, compose:{standard:16,challenging:3,essay:0},
    blurb:"Layered architecture, entity mapping, inheritance strategies, associations/DTOs, streams." },
  { id:"quality",title:"Java Mock — Testing, SOLID & Patterns",
    topics:JAVA_TOPIC_GROUPS.QUALITY, compose:{standard:15,challenging:3,essay:0},
    blurb:"JUnit/Mockito (Dummy/Stub/Mock, MockMvc, TDD), SOLID/GRASP refactoring, GoF design patterns." },
  { id:"distrib",title:"Java Mock — Microservices & Security",
    topics:JAVA_TOPIC_GROUPS.DISTRIB, compose:{standard:12,challenging:2,essay:0},
    blurb:"Bounded contexts, WebClient, API gateway routes, OAuth2 / JWT / OpenID Connect / SAML." },
  { id:"hard",   title:"Java Mock — Hard Challenge Exam",
    topics:JAVA_BASE, compose:{standard:6,challenging:12,essay:0},
    blurb:"Mostly 2-point reasoning & code-trap items. Built to push you before the real exam." },
  { id:"collection", title:"Complete Quiz Collection — all chapters",
    topics:["Collection"], compose:{standard:QUIZ_PDF_QUESTIONS.length,challenging:0,essay:0},
    blurb:"Every question from the complete quiz collection — JPA, REST & streams, IAM & exceptions, testing & TDD, SOLID & refactoring, design patterns and microservices. Options shuffled each attempt." },
];
