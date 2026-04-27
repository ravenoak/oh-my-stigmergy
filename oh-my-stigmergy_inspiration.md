**The Sublated Software Development Life Cycle: Dialectical Validation
and Systemic Architecture for Intention-First Agentic Frameworks**

**1. Epistemological Re-Framing: Interrogating the \"Reality Gap\" and
the Reification of Intent**

The software development life cycle (SDLC) has historically operated
under an implicit epistemological assumption: the compiled codebase is
the ultimate ground truth of the system.^1^ Implementation details,
architectural boundaries, and operational constraints are instantiated
within the code, while the underlying human intention---the \"why\"
behind the implementation---is relegated to ephemeral tribal knowledge,
scattered across chat logs, emails, and passive documentation.^1^ The
introduction of autonomous Large Language Model (LLM) agents into this
environment has precipitated a structural crisis, revealing a profound
\"Reality Gap\" between what a system currently executes and what it was
originally intended to achieve.^1^

When autonomous agents are deployed into legacy codebases without
explicitly formalized intent, they engage in pattern-matching against
existing implementations.^3^ If the legacy code contains expedient
hacks, logical bugs, or degraded architectural patterns, the agent
reliably mimics and amplifies these anti-patterns, accelerating a
systemic degradation termed \"Context Drift\".^1^ To arrest this
entropy, emerging paradigms propose an \"intention-first\" architecture,
transitioning from manual prompt-engineering to the encoding of
intentions as first-class, executable artifacts.^1^

Interrogating this premise requires surfacing its underlying
assumptions. The framework inherently serves the interests of system
architects and stakeholders attempting to impose top-down determinism
onto the probabilistic behaviors of autonomous swarms. However, this
orientation risks committing the fallacy of reification---treating the
highly abstract, subjective, and frequently contradictory nature of
human intention as a concrete, mathematically precise artifact. Tools
such as Allium attempt to mitigate this by providing an LLM-native
specification language.^3^ Allium operates entirely without a runtime or
compiler; it is purely descriptive, formalizing intent through
structured entities, rules, transition graphs, and state-dependent
fields utilizing when, requires, and ensures clauses.^3^

The dialectical tension within this paradigm becomes visible when
contrasting Allium\'s dual methodologies: elicitation and
distillation.^1^ Elicitation works forward, utilizing structured
conversations with stakeholders to define intent.^7^ Distillation works
backward, utilizing LLMs to extract a behavioral specification from the
\"as-built\" reality of the existing code.^7^ When the elicited
specification contradicts the distilled specification, the framework
posits that the contradiction locates a high-value divergence requiring
remediation.^1^ Yet, applying Socratic elenchus reveals a vulnerability:
the framework presupposes that the elicited human intent is flawless. If
the elicited intent is based on flawed assumptions regarding system
constraints, the resulting specification forces the agent into an
unresolvable state. Therefore, intent cannot function as an absolute
filter; it must act as a dialectical counterweight to the empirical
reality of the codebase, requiring a mechanical verification layer to
resolve contradictions.

**2. The Latent State Failure and Architectural Belief Construction**

To stress-test the hypothesis that agents fail due to an inability to
comprehend system architecture, one must audit the empirical evidence
tracking agentic cognitive mapping. The \"Theory of Code Space\" (ToCS)
benchmark provides a rigorous framework for evaluating whether agents
can actively construct, revise, and exploit coherent architectural
beliefs.^8^

ToCS formalizes codebase understanding as belief construction over a
latent architectural state, denoted as
![image](76383747407fbfc1806e2217110de7a67dc1fe20.png){width="0.13541666666666666in"
height="0.25in"}.^8^ This state is represented as a typed dependency
graph
![image](a088a0597c500c4b63f67a92d6994eb5c2b20eaa.png){width="1.0in"
height="0.25in"}, mapped against four empirically verified edge types
that agents must discover.^8^

  ---------------- ---------------------------- ------------------------------------------------- ------------------------
  **Edge Type**    **Discovery Method**         **Structural Significance**                       **Proportion in ToCS**
                                                                                                  
  Imports          Static AST Parsing           Basic module dependency and visibility.           \~67% ^8^
                                                                                                  
  Calls_API        Dynamic or Static Analysis   Functional dependencies and service boundaries.   \~17% ^8^
                                                                                                  
  Registry_Wires   Config/Metadata Parsing      Dynamic composition and dependency injection.     \~9% ^8^
                                                                                                  
  Data_Flows       Taint Analysis/Reasoning     Data integrity and validation chains.             \~7% ^8^
                                                                                                  
  ---------------- ---------------------------- ------------------------------------------------- ------------------------

The ToCS framework forces agents to explore procedurally generated,
medium-complexity codebases under strict partial observability.^8^
Agents are constrained by a budget of
![image](8f214f6911f91827364e9b4099a40acbc6196c07.png){width="0.6354166666666666in"
height="0.25in"} actions, utilizing a restricted toolset (LIST, OPEN,
SEARCH, INSPECT) that prevents them from loading the entire repository
into context simultaneously.^8^ Every
![image](fa7856f6ef2fd54a1b21521f114247d38cde9e32.png){width="0.5520833333333334in"
height="0.25in"} actions, the system executes a \"Cognitive Map Probe,\"
interrupting the agent to externalize its current architectural belief
as a structured JSON object.^8^

Tracing the systemic outputs of these probes reveals two severe failure
modes inherent to current agentic frameworks. The first is **Belief
Collapse**, defining a state where an agent catastrophically forgets
previously discovered architectural components and cross-module
invariants between reasoning steps.^8^ Empirical testing demonstrates a
profound size-inversion anomaly regarding this collapse. Testing on
frontier models revealed that while a smaller model (Gemini 2.5 Flash)
maintained perfectly stable architectural beliefs across consecutive
probes, its larger, vastly more capable sibling (Gemini 2.5 Pro)
suffered catastrophic belief collapse, frequently peaking in
comprehension around steps 6 through 9 before its internal cognitive map
disintegrated.^8^ Models like GPT-5.3-Codex and Claude Sonnet 4.6,
conversely, demonstrated steady knowledge accumulation.^8^

The second failure mode is **Belief Inertia**, characterized by an
agent\'s failure to update its internal maps when the underlying
environment mutates
(![image](a739acee0107d16432e46cae403201024cfd0c78.png){width="0.6354166666666666in"
height="0.25in"}).^8^ When agents suffer from Belief Inertia, they
continue to engineer solutions based on deprecated architectural states,
generating syntactically valid but structurally toxic code.

The ToCS data yields a critical systemic insight: tacit knowledge within
an LLM does not survive long-horizon execution.^8^ Retaining structured
belief maps within the context window acts as a mandatory
self-scaffolding mechanism.^8^ Without continuous, mechanically enforced
externalization of beliefs, the autonomous swarm operates with severe
anterograde amnesia, fundamentally invalidating any SDLC that relies on
unprompted LLM architectural retention.

**3. Constraint Enforcement and the Fallacy of Composition**

If agentic belief states are highly volatile, relying on passive
instruction files (e.g., AGENTS.md) to guide behavior represents a
critical systemic vulnerability. The assumption that providing an agent
with a markdown file of rules will result in globally compliant
architecture relies on the fallacy of composition---assuming that
because an agent can parse a rule locally, it can apply its consequences
globally. The ContextCov framework addresses this by deriving executable
constraints directly from natural language instruction files, bridging
the gap between passive documentation and active runtime enforcement.^4^

ContextCov operates by parsing instruction files via a hierarchical,
path-aware algorithm that preserves semantic scope.^4^ It then routes
the extracted intents into domain-specialized code synthesizers,
establishing a tripartite enforcement perimeter ^4^:

  ------------------------------- ----------------------------------------------------- ------------------------------------------------------------------
  **Enforcement Domain**          **Implementation Mechanism**                          **Detection Target**
                                                                                        
  **Process Constraints**         Runtime shell shims via PATH injection.               Prohibited operations (e.g., intercepting npm run compile). ^4^
                                                                                        
  **Source Constraints**          Abstract Syntax Tree (AST) queries via Tree-sitter.   Deprecated APIs, explicit type violations, formatting rules. ^4^
                                                                                        
  **Architectural Constraints**   Deterministic graph validation via NetworkX.          Circular dependencies, layer breaches, domain isolation. ^4^
                                                                                        
  ------------------------------- ----------------------------------------------------- ------------------------------------------------------------------

The efficacy of this mechanism is empirically robust; evaluations across
723 open-source repositories demonstrated the successful extraction of
over 46,000 executable checks, achieving a syntax validity rate of
99.997%.^5^ When a process constraint is violated, ContextCov\'s
execution shims actively block the terminal command and inject
actionable feedback directly into the agent\'s stdout.^11^ This forces
the agent to self-correct its execution trajectory before the error can
compound into the codebase.

However, mapping the full logical space of ContextCov reveals a subtle
but critical fragility. The framework relies on an LLM (gpt-5.2-chat) to
perform intent routing and synthesize the Python-based evaluation
logic.^4^ This creates a recursive loop where a probabilistic system is
generating the deterministic boundaries meant to constrain other
probabilistic systems. If the synthesizing model misinterprets a highly
complex semantic architectural constraint, it will synthesize an
inherently flawed graph algorithm. The resulting network will silently
enforce an incorrect architectural boundary, eroding the system over
time. To survive empirical validation, constraints generated by
ContextCov must themselves be validated against a formal specification
language like Allium, anchoring the generated Python checks against an
immutable, human-verified contract.

**4. Testing for Gauge Invariance: Relation-First Navigation vs. Vector
Proximity**

To validate the necessity of explicit dependency mapping in agentic
environments, we must test the conclusion for gauge invariance. If a
system\'s true complexity is mapped accurately, its structural reality
should remain intact when observed through different methodological
lenses. The document asserts that standard Retrieval-Augmented
Generation (RAG) dilutes agent context, advocating instead for
Relation-First Knowledge Graphs.^1^

Standard RAG methodologies rely on vector embeddings and cosine
similarity. In highly complex, multi-module codebases, cosine similarity
frequently retrieves \"lookalike\" interfaces, loosely related snippets,
or shadow implementations that match semantic descriptions but lack true
topological relevance.^12^ This floods the agent\'s context window with
off-target data, accelerating Meaning Drift.

The **Hound** framework provides an alternative, gauge-invariant
approach. Hound operates as a language-agnostic code auditor that
replaces probabilistic semantic search with exact, reference-driven
retrieval.^12^ The implementation mechanics of Hound rigorously anchor
an agent to empirical codebase realities:

  -------------------------------- ----------------------------------------------------------------------------------------------------------------------------------------- --------------------------------------------------------------------------------------------------------------------
  **Hound Component**              **Technical Mechanism**                                                                                                                   **Systemic Function**
                                                                                                                                                                             
  **Byte-Accurate Cards**          Linear chunking of the repository into contiguous slices annotated with exact char_start and char_end offsets. ^12^                       Guarantees complete, non-overlapping coverage without relying on brittle AST parsers. ^13^
                                                                                                                                                                             
  **Aspect Graphs**                Generation of multi-scale semantic lenses (e.g., AuthenticationRoles, MonetaryFlows, SystemArchitecture). ^12^                            Allows agents to zoom out to high-level system structure and zoom in to decisive code blocks. ^12^
                                                                                                                                                                             
  **Reference-Driven Retrieval**   Tool calls (load_node) follow explicit node and edge references to retrieve only incident code cards. ^12^                                Eliminates cosine-similarity hallucinations, ensuring the context window remains pristine and highly focused. ^12^
                                                                                                                                                                             
  **Dual-Model Economics**         Separation of concerns between a senior \"Strategist\" model for hypothesis generation and a junior \"Scout\" model for execution. ^12^   Yields senior-level reasoning at junior-level computational costs while preserving execution determinism. ^12^
                                                                                                                                                                             
  -------------------------------- ----------------------------------------------------------------------------------------------------------------------------------------- --------------------------------------------------------------------------------------------------------------------

Empirical metrics validate this approach. On the ScaBench evaluation
framework, Hound demonstrated a 31.2% micro recall against an 8.3%
baseline, with an F1 score of 14.2% versus 9.8%.^14^ The reason for this
massive performance delta is rooted in systems tracing: Hound forces the
agent into a hypothesis-centric loop.^14^ Instead of spraying shallow
checks across a massive vector database, the agent maps explicit
constraints and hunts for contradictions between stated invariants and
observed implementations.^12^

When we run the concept of software architecture through ToCS,
ContextCov, and Hound, the result remains invariant: agents cannot
navigate software based on semantic meaning alone; they require
explicit, topological graphs. The necessity of the graph survives
framework transformation, proving that relation-first navigation tracks
the genuine complexity of modern software systems.

**5. Systems Trace: The Failure of Coercive Hierarchy in Agent
Coordination**

The transition from single-agent coding assistants to autonomous
multi-agent teams is currently dominated by hierarchical orchestration
models. The *oh-my-openagent* (OMO) framework exemplifies this paradigm,
deploying a \"virtual dev team\" operating in parallel.^15^ While highly
sophisticated, tracing the systemic dynamics of OMO reveals fatal
leverage points that compromise system longevity.

**5.1 The Architecture of OMO Orchestration**

OMO is engineered around a central orchestrator named \"Sisyphus,\"
heavily optimized for models like Claude Opus 4.7 or Kimi K2.5.^15^
Sisyphus does not execute code; it delegates tasks via strict category
routing.^15^

  ------------------- ---------------------------- ---------------------------------- ---------------------------------------------------------------------------------------------------
  **Agent Persona**   **Orchestration Category**   **Optimal Model Target**           **Specialized Function**
                                                                                      
  **Sisyphus**        orchestrator                 Claude Opus 4.7 / Kimi K2.5 ^16^   Primary planning, task delegation, and aggressive parallel execution tracking. ^15^
                                                                                      
  **Prometheus**      planner                      Claude Opus 4.7 ^1^                Conducts pre-execution interviews to establish boundaries and build verified markdown plans. ^15^
                                                                                      
  **Hephaestus**      deep                         GPT-5.4 (medium) ^17^              Autonomous deep worker for complex architectural reasoning and heavy research. ^15^
                                                                                      
  **Oracle**          ultrabrain                   GPT-5.4 (xhigh) ^15^               Hard logic resolution and high-level architectural debugging. ^15^
                                                                                      
  ------------------- ---------------------------- ---------------------------------- ---------------------------------------------------------------------------------------------------

The system attempts to prevent code corruption through mechanisms like
\"Hashline,\" a hash-anchored edit tool that tags every line of code
with a unique identifier (LINE#ID).^15^ This validates that a file
remains unchanged between the agent\'s read and write operations, a tool
that reportedly increased execution success rates from 6.7% to
68.3%.^15^ Further stability is enforced by \"IntentGate,\" a
pre-processing firewall that prevents agents from taking literal,
hallucinated misinterpretations of user prompts.^15^

**5.2 The \"Token Furnace\" and Meaning Drift**

Despite these technical achievements, the coercive hierarchy of OMO
contains a cascading failure loop. The system relies entirely on
Sisyphus\'s massive 1,100-line master prompt to maintain state.^1^ As
the execution session extends, the continuous prompted handoffs between
Sisyphus, Prometheus, Momus (the plan reviewer), and Atlas (the
conductor) require complete synchronization of the context window.^1^

This architecture generates what practitioners term the \"Token
Furnace,\" pushing session inference costs to an unsustainable \$50 to
\$100 per task.^18^ More critically, as the context window swells, the
orchestrator begins to suffer from Meaning Drift. By prompt twenty, the
orchestrator is no longer anchoring its behavior to the codebase or the
original Allium specification; it is pattern-matching against its own
previous outputs.^3^ The system becomes a closed, self-referential loop,
entirely detached from the empirical reality of the SDLC. The rigid
hierarchy ultimately fails because it optimizes for task completion
rather than constraint satisfaction, encouraging subagents to output
bloated, fragile code simply to satisfy the orchestrator\'s checklist.

**6. Stigmergic Swarms and the Thermodynamics of Coordination**

Applying tetralemma analysis to the problem of multi-agent coordination
yields the following logical space: (1) Agents are hierarchically
controlled (OMO), which fails due to context bloat; (2) Agents operate
in total isolation, which fails due to resource collision; (3) Both hold
conditionally, requiring a massive centralized queueing system; (4)
Neither holds---the solution requires abandoning explicit
message-passing entirely.

This fourth quadrant is realized through the **Stigmergic Blackboard
Protocol (SBP)**.^19^ Stigmergy, the mechanism by which ant colonies
coordinate without a central queen, allows agents to communicate
implicitly by modifying a shared environment.^20^ SBP removes the
Sisyphus orchestrator entirely, replacing it with a structured semantic
ledger.

**6.1 The Mechanics of Digital Pheromones**

In SBP, when an agent identifies a gap in the architecture or a user
requests a feature, it does not send a direct message to a peer.
Instead, it deposits a \"Digital Pheromone\" onto the blackboard.^20^

  -------------------------------- ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- -----------------------------------------------------------------------------------------------------------------------------
  **SBP Mechanism**                **Technical Execution**                                                                                                                                                                                                      **Systemic Consequence**
                                                                                                                                                                                                                                                                
  **Noise Filtering via Stance**   Agents evaluate the ledger against their internal \"Stance Vector.\" They only perceive pheromones exceeding their specific olfactory threshold. ^20^                                                                        Eliminates fan-out logic and routing overhead. Adding 1,000 agents requires zero changes to the network topology. ^20^
                                                                                                                                                                                                                                                                
  **Atomic Idempotency**           Destructive actions are bound to a UUID. The first agent to act marks the UUID consumed. ^20^                                                                                                                                Subsequent agents read a stale lock and skip the action, organically preventing race conditions and duplicated effort. ^20^
                                                                                                                                                                                                                                                                
  **Temporal Decay**               Pheromones possess a ![image](c84db319abebcc1c0d46488144c45e553bedac70.png){width="0.10416666666666667in" height="0.21875in"} decay rate, degrading in intensity over time unless actively reinforced by observation. ^20^   Differentiates signal validity temporally, naturally pruning abandoned tasks and preventing infinite ledger bloat. ^20^
                                                                                                                                                                                                                                                                
  -------------------------------- ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- -----------------------------------------------------------------------------------------------------------------------------

**6.2 Market-Based Economic Coordination**

To optimize resource allocation within a stigmergic swarm, the
environment can be modeled as a microeconomy utilizing Market-Based
Coordination.^21^ In this model, agents are allocated a budget of
computational tokens. When a high-intensity pheromone appears, available
agents calculate their confidence score against their localized context
and \"bid\" on the execution.^21^ High-value tasks naturally attract the
most capable agents. This distributed economic coordination aligns the
micro-incentives of individual models with the macro-goal of the SDLC:
maximizing architectural value per compute unit expended.^22^

However, practicing elenchus requires asking what happens when the swarm
reaches a fundamental disagreement. If Agent A (Security Stance) bids to
implement strict data validation, and Agent B (Performance Stance) bids
to bypass validation for latency gains, the stigmergic system lacks an
inherent conflict resolution mechanism, threatening to stall the SDLC
indefinitely.

**7. The Sublation Crucible: Liquid Democracy and Non-Differentiable
Boundaries**

To resolve inevitable contradictions within an autonomous swarm, the
architecture requires mechanisms that convert conflict into productive
tension. The first proposed mechanism is **Liquid Democracy**, a fluid
consensus model allowing agents to dynamically delegate their
computational voting weight to peers possessing higher localized
expertise.^23^

**7.1 The Limits of Transitive Delegation**

In liquid democracy, if an agent encounters a domain outside its
capability (e.g., a frontend agent encountering a cryptographic
protocol), it transitively delegates its vote.^24^ Research mapping
these systems via Pólya urn dynamics highlights a critical risk: the
concentration of power.^23^ Empirical analyses of blockchain-based
Liquid Democracy implementations across 250,000 voters and 1,700
proposals demonstrated substantial \"clumping,\" where a vast majority
of delegated weight accumulated onto a few highly popular nodes.^24^ If
an Oracle agent within the SDLC accumulates massive transitive weight,
the decentralized swarm subtly collapses back into a centralized
dictatorship, completely undoing the benefits of SBP.

**7.2 Z3 SMT Solvers and the Translation Synthesis**

To prevent the calcification of power and ensure absolute architectural
integrity, the SDLC must introduce a non-differentiable regulatory
backstop: **The Sublation Operator**.^1^

Dialectical sublation (*Aufhebung*) preserves opposing forces while
elevating them to a higher truth. In this architecture, the operator is
not an LLM, but a combination of Open Policy Agent (OPA) gateways and Z3
SMT (Satisfiability Modulo Theories) solvers.^1^ When agents arrive at
an impasse, their proposed code mutations and the underlying Allium
specifications are compiled into formal logic.

Z3 calculates the mathematical intersection---the \"Satisfiability
Space\"---where both the security invariant and the performance
optimization hold true.^1^ Because Z3 operates on discrete boolean
logic, it is entirely immune to LLM coercion or prompt-injection. If the
proposed architecture is unsatisfiable (unsat), the mutation is
mechanically rejected.

**Locating the Genuine Complexity:** The true emergent complexity of
this entire SDLC paradigm lies exclusively in the translation structure
between frameworks.^26^ Translating the natural language state
transitions of Allium into rigorous SMT-LIB-2.0 syntax is a profound
semantic challenge. If an LLM is used to translate Allium to SMT, the
system inherits the hallucination risks of the model, rendering the Z3
verification an illusion of rigorous security (false precision). The
synthesis requires a deterministic, Abstract Syntax Tree (AST) compiler
(such as the Rust-based allium-tools ^3^) to bridge the human-readable
intent directly into solver logic without probabilistic interference.

By binding autonomous agentic exploration within the hard mathematical
boundaries of Z3 solvers and the precise topological maps of Hound, the
software development process evolves. It ceases to be a conversational
exercise in generating text and becomes the rigorous navigation of a
mathematically defined satisfiability space.

**8. Product Requirements Document (PRD): The Sublate Plurality SDLC**

Based on the rigorous critical examination of current hierarchical
models (OMO), verification gaps (ToCS), retrieval failures (RAG), and
coordination bottlenecks, the following PRD outlines the necessary
architecture to construct a resilient, intention-first Agentic SDLC.

**8.1 Product Vision and Scope**

**Vision:** To engineer a decentralized, mathematically verified
software development environment where multi-agent swarms coordinate via
environmental stigmergy, and all codebase mutations are mechanically
validated against formalized human intent.

**Scope:** This specification details the replacement of centralized LLM
orchestrators with three core pillars: The Intent Elicitation Engine,
the Stigmergic Blackboard Protocol (SBP), and the Z3 Sublation Engine.

**8.2 Actor Profiles**

1.  **Human Architect:** Defines system boundaries, interacts with the
    Elicitation Engine to generate .allium specs, and reviews unsat core
    rejections. Does not manage task queues.

2.  **Stance-Driven Agents (Scouts/Workers):** Autonomous LLM instances
    operating under specific parameter weights (Stance Vectors). They
    independently seek out high-intensity environmental signals and
    execute code mutations.

3.  **The Sublation Engine (Crucible):** The non-negotiable verification
    layer comprised of deterministic tools (Tree-sitter, NetworkX, Z3,
    OPA) that validates or rejects agent outputs.

**8.3 Core Epics and Functional Requirements**

**Epic 1: Elicitation and Intent Formalization (Allium Integration)**

The system must establish the ground truth of system behavior
independent of legacy code.

  ------------ -------------------------------------------------------------------------------------------------------------- --------------------------------------------------------------------------------------------------------------------------------------------------
  **ID**       **Requirement Description**                                                                                    **Technical Constraint**
                                                                                                                              
  **FR-1.1**   The platform shall support bidirectional specification synchronization via Allium.                             Must parse .allium syntax natively, handling entity, rule, when, and ensures blocks. ^6^
                                                                                                                              
  **FR-1.2**   The system must provide a Distillation skill capable of generating draft specs from existing AST structures.   Must highlight unmapped variables and missing state transitions to the Human Architect. ^6^
                                                                                                                              
  **FR-1.3**   State-dependent fields and transition graphs must act as hard execution boundaries.                            Any proposed code that allows a state change not explicitly defined in the .allium transition graph must be flagged as a critical violation. ^3^
                                                                                                                              
  ------------ -------------------------------------------------------------------------------------------------------------- --------------------------------------------------------------------------------------------------------------------------------------------------

**Epic 2: Topological Navigation (Hound Relation-First Graphs)**

Agents must navigate code without relying on cosine similarity.

  ------------ -------------------------------------------------------------------------------------- -------------------------------------------------------------------------------------------------------------------------------------------
  **ID**       **Requirement Description**                                                            **Technical Constraint**
                                                                                                      
  **FR-2.1**   The ingestion engine shall chunk all repository files into byte-accurate Code Cards.   Cards must be indexed by immutable char_start and char_end integers to guarantee deterministic retrieval. ^12^
                                                                                                      
  **FR-2.2**   A background \"Scout\" agent shall continuously generate and update Aspect Graphs.     Must support specific views: SystemArchitecture, MonetaryFlows, and AuthRoles. ^12^
                                                                                                      
  **FR-2.3**   The system shall expose a load_node(id) tool to all execution agents.                  The tool must return *only* the specific byte-slices referenced by the node\'s incident edges, strictly minimizing context overhead. ^12^
                                                                                                      
  ------------ -------------------------------------------------------------------------------------- -------------------------------------------------------------------------------------------------------------------------------------------

**Epic 3: Stigmergic Blackboard Coordination (SBP)**

Swarms must self-organize without explicit prompting or central
planning.

  ------------ --------------------------------------------------------------------------------------- -------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **ID**       **Requirement Description**                                                             **Technical Constraint**
                                                                                                       
  **FR-3.1**   The platform must deploy a high-throughput, centralized semantic ledger (Blackboard).   Must support sub-millisecond atomic transactions and Server-Sent Events (SSE). ^20^
                                                                                                       
  **FR-3.2**   The system shall encode all tasks and environment states as Digital Pheromones.         Payloads must include TaskUUID, StanceTarget, BaseIntensity, and a calculated DecayRate. ^20^
                                                                                                       
  **FR-3.3**   The ledger must enforce strict UUID idempotency to prevent execution collisions.        \"Last write wins\" atomicity; once a UUID is marked active by an agent, the record becomes instantly stale for the swarm. ^20^
                                                                                                       
  **FR-3.4**   The system must implement a Pheromone Floor to prevent critical path failure.           If a critical task\'s intensity decays below global agent olfactory thresholds without action, the system must dynamically inflate the bidding token reward. ^20^
                                                                                                       
  ------------ --------------------------------------------------------------------------------------- -------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Epic 4: The Sublation Crucible (Z3 + ContextCov Gateway)**

Code mutations must be mathematically verified against intent before
integration.

  ------------ -------------------------------------------------------------------------------------- ------------------------------------------------------------------------------------------------------------------------------------------------------------
  **ID**       **Requirement Description**                                                            **Technical Constraint**
                                                                                                      
  **FR-4.1**   The platform shall intercept all agent shell commands via PATH injection.              ContextCov process shims must evaluate commands against OPA policies in real-time, blocking unauthorized actions (e.g., bypassing linting). ^4^
                                                                                                      
  **FR-4.2**   The platform must deterministically compile .allium specifications into SMT-LIB-2.0.   Must utilize the Rust-based allium-tools AST parser to generate universally quantified assert statements. No LLMs permitted in this translation step. ^26^
                                                                                                      
  **FR-4.3**   All code integrations must pass a Z3 Satisfiability evaluation.                        If the proposed state change returns unsat, the system must translate the unsat core back into an actionable debug trace for the agent.
                                                                                                      
  ------------ -------------------------------------------------------------------------------------- ------------------------------------------------------------------------------------------------------------------------------------------------------------

**9. Technical Design Document (TDD): Architecture and Implementation**

This document provides the technical architecture necessary to
instantiate the requirements of the Sublate Plurality SDLC. It defines
system topologies, schema designs, and data flow mechanisms.

**9.1 System Architecture Topology**

The architecture completely deprecates the star-topology of OMO (where a
Sisyphus node orchestrates all I/O). Instead, it utilizes an
event-driven Bus Topology, where the Stigmergic Blackboard functions as
the universal event bus.

  ------------------------- ---------------------- --------------------------------------------------- ----------------------------------------------------------------------------------------------------
  **Architectural Layer**   **Component**          **Core Technology**                                 **Function**
                                                                                                       
  **Cognitive Layer**       Stance-Driven Agents   OpenCode framework, Claude 3.5 Sonnet, GPT-5.4      Consumes pheromones, executes code mutations, externalizes architectural beliefs.
                                                                                                       
  **Coordination Layer**    SBP Server             Node.js / TypeScript, Redis (In-Memory Datastore)   Manages atomic state locks, calculates exponential decay of signals, broadcasts SSE streams. ^27^
                                                                                                       
  **Epistemic Layer**       Hound Graph Engine     Python, NetworkX, SQLite, Tree-sitter               Ingests source code, builds Aspect Graphs, resolves load_node requests into exact byte-cards. ^12^
                                                                                                       
  **Verification Layer**    Sublation Bridge       Rust (allium-tools), Z3 SMT Solver, OPA             Parses .allium to SMT logic, enforces ContextCov execution shims, calculates satisfiability. ^11^
                                                                                                       
  ------------------------- ---------------------- --------------------------------------------------- ----------------------------------------------------------------------------------------------------

**9.2 Data Schemas and State Management**

To achieve decentralized coordination, the system relies on structured
configurations rather than natural language instructions.

**9.2.1 Agent Stance Configuration**

Agents are instantiated with a persistent stance_vector that dictates
their behavior and filtering thresholds.

JSON

{\
\"agent_id\": \"worker_node_alpha\",\
\"model_engine\": \"gpt-5.4\",\
\"stance_vector\": {\
\"security_auditing\": 0.95,\
\"performance_optimization\": 0.20,\
\"feature_implementation\": 0.10,\
\"dependency_refactoring\": 0.60\
},\
\"olfactory_threshold\": 0.75,\
\"token_budget\": 5000000\
}

*Systemic Logic:* This agent will completely ignore feature
implementation pheromones unless their intensity has been artificially
inflated past the 0.75 threshold due to prolonged swarm neglect.

**9.2.2 Stigmergic Pheromone Record**

The Redis datastore maintains state utilizing a standardized Pheromone
record. The decay calculation
![image](79fc7aa2dc635c478f9e586211546af6b0b7a44a.png){width="1.0833333333333333in"
height="0.25in"} is executed continuously on read.

JSON

{\
\"pheromone_uuid\": \"f47ac10b-58cc-4372-a567-0e02b2c3d479\",\
\"origin_agent\": \"scout_node_beta\",\
\"intent_reference\": \"auth.allium#UserRequestsPasswordReset\",\
\"target_stance\": \"security_auditing\",\
\"base_intensity\": 1.0,\
\"decay_rate\": 0.05,\
\"timestamp_created\": 1713824100,\
\"payload\": {\
\"graph_node_id\": \"auth_middleware_v2\",\
\"observation\": \"Missing rate limiter on password reset route.\"\
},\
\"lock_status\": \"AVAILABLE\"\
}

**9.3 Critical Execution Workflows**

**9.3.1 The Hound Retrieval Flow (Mitigating Belief Collapse)**

1.  **Trigger:** An agent decides to investigate the auth_middleware_v2
    node based on a pheromone signal.

2.  **Request:** The agent invokes load_node(\"auth_middleware_v2\").

3.  **Graph Traversal:** The Hound Engine queries the SQLite DB,
    identifying all edges connected to the node (e.g., CALLS_API to
    db_connector, IMPORTS from crypto_lib).

4.  **Slice Aggregation:** The engine retrieves the specific char_start
    and char_end strings for the target node and its direct
    dependencies.

5.  **Response:** The agent receives a hyper-condensed, byte-accurate
    context window containing only the topologically verified
    dependencies, bypassing cosine similarity vector noise entirely.^12^

**9.3.2 The Sublation Verification Flow (Mitigating Context Drift)**

1.  **Mutation Proposal:** An agent completes a code mutation and
    attempts to commit the change.

2.  **ContextCov Interception:** The Git commit hook is intercepted by
    the ContextCov shim.

3.  **AST Generation:** The Rust allium-tools binary parses the
    governing .allium specification into an Abstract Syntax Tree.

4.  **SMT Compilation:** The AST is deterministically mapped to
    SMT-LIB-2.0 variables and constraints (e.g., converting an Allium
    ensures: status = locked into (assert (= next_status locked))).

5.  **Code State Extraction:** The proposed code changes are parsed by
    Tree-sitter to extract the new functional state.

6.  **Z3 Evaluation:** The Z3 solver tests the combination of the code
    state and the SMT constraints.

7.  **Resolution:**

    - If sat, the execution shim releases the lock and the code is
      committed.

    - If unsat, the commit is blocked, the unsat core is extracted,
      mapped to the specific lines of violating code, and deposited as a
      new, high-intensity pheromone on the Blackboard for immediate
      remediation.

This rigorous, constraint-driven framework ensures that intention
remains the primary governing artifact of the SDLC. By structurally
preventing Belief Collapse through graph topology, and neutralizing
coercive orchestration through stigmergy and non-differentiable solvers,
the system maps and manages the genuine complexity of autonomous
software development.

**Works cited**

1.  Agentic SDLC: Intent, Graphs, and Sublation

2.  About - Allium LLM-native spec language, accessed April 22, 2026,
    [[https](https://juxt.github.io/allium/about)[://](https://juxt.github.io/allium/about)[juxt](https://juxt.github.io/allium/about)[.](https://juxt.github.io/allium/about)[github](https://juxt.github.io/allium/about)[.](https://juxt.github.io/allium/about)[io](https://juxt.github.io/allium/about)[/](https://juxt.github.io/allium/about)[allium](https://juxt.github.io/allium/about)[/](https://juxt.github.io/allium/about)[about](https://juxt.github.io/allium/about)]{.underline}

3.  juxt/allium-tools - GitHub, accessed April 22, 2026,
    [[https](https://github.com/juxt/allium-tools)[://](https://github.com/juxt/allium-tools)[github](https://github.com/juxt/allium-tools)[.](https://github.com/juxt/allium-tools)[com](https://github.com/juxt/allium-tools)[/](https://github.com/juxt/allium-tools)[juxt](https://github.com/juxt/allium-tools)[/](https://github.com/juxt/allium-tools)[allium](https://github.com/juxt/allium-tools)[-](https://github.com/juxt/allium-tools)[tools](https://github.com/juxt/allium-tools)]{.underline}

4.  ContextCov: Deriving and Enforcing Executable Constraints from Agent
    Instruction Files, accessed April 22, 2026,
    [[https](https://arxiv.org/html/2603.00822v1)[://](https://arxiv.org/html/2603.00822v1)[arxiv](https://arxiv.org/html/2603.00822v1)[.](https://arxiv.org/html/2603.00822v1)[org](https://arxiv.org/html/2603.00822v1)[/](https://arxiv.org/html/2603.00822v1)[html](https://arxiv.org/html/2603.00822v1)[/2603.00822](https://arxiv.org/html/2603.00822v1)[v](https://arxiv.org/html/2603.00822v1)[1](https://arxiv.org/html/2603.00822v1)]{.underline}

5.  ContextCov: Deriving and Enforcing Executable Constraints from Agent
    Instruction Files - arXiv, accessed April 22, 2026,
    [[https](https://arxiv.org/pdf/2603.00822)[://](https://arxiv.org/pdf/2603.00822)[arxiv](https://arxiv.org/pdf/2603.00822)[.](https://arxiv.org/pdf/2603.00822)[org](https://arxiv.org/pdf/2603.00822)[/](https://arxiv.org/pdf/2603.00822)[pdf](https://arxiv.org/pdf/2603.00822)[/2603.00822](https://arxiv.org/pdf/2603.00822)]{.underline}

6.  Allium LLM-native spec language, accessed April 22, 2026,
    [[https](https://juxt.github.io/allium/language)[://](https://juxt.github.io/allium/language)[juxt](https://juxt.github.io/allium/language)[.](https://juxt.github.io/allium/language)[github](https://juxt.github.io/allium/language)[.](https://juxt.github.io/allium/language)[io](https://juxt.github.io/allium/language)[/](https://juxt.github.io/allium/language)[allium](https://juxt.github.io/allium/language)[/](https://juxt.github.io/allium/language)[language](https://juxt.github.io/allium/language)]{.underline}

7.  Home - Allium LLM-native spec language, accessed April 22, 2026,
    [[https](https://juxt.github.io/allium/)[://](https://juxt.github.io/allium/)[juxt](https://juxt.github.io/allium/)[.](https://juxt.github.io/allium/)[github](https://juxt.github.io/allium/)[.](https://juxt.github.io/allium/)[io](https://juxt.github.io/allium/)[/](https://juxt.github.io/allium/)[allium](https://juxt.github.io/allium/)[/](https://juxt.github.io/allium/)]{.underline}

8.  Theory of Code Space: Do Code Agents Understand Software
    Architecture? - arXiv, accessed April 22, 2026,
    [[https](https://arxiv.org/abs/2603.00601)[://](https://arxiv.org/abs/2603.00601)[arxiv](https://arxiv.org/abs/2603.00601)[.](https://arxiv.org/abs/2603.00601)[org](https://arxiv.org/abs/2603.00601)[/](https://arxiv.org/abs/2603.00601)[abs](https://arxiv.org/abs/2603.00601)[/2603.00601](https://arxiv.org/abs/2603.00601)]{.underline}

9.  Theory of Code Space: Do Code Agents Understand Software
    Architecture? - ResearchGate, accessed April 22, 2026,
    [[https](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[://](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[www](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[.](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[researchgate](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[.](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[net](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[/](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[publication](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[/401470216\_](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[Theory](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[\_](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[of](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[\_](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[Code](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[\_](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[Space](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[\_](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[Do](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[\_](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[Code](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[\_](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[Agents](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[\_](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[Understand](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[\_](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[Software](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[\_](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)[Architecture](https://www.researchgate.net/publication/401470216_Theory_of_Code_Space_Do_Code_Agents_Understand_Software_Architecture)]{.underline}

10. Theory of Code Space: Do Code Agents Understand Software
    Architecture? - arXiv, accessed April 22, 2026,
    [[https](https://arxiv.org/html/2603.00601v3)[://](https://arxiv.org/html/2603.00601v3)[arxiv](https://arxiv.org/html/2603.00601v3)[.](https://arxiv.org/html/2603.00601v3)[org](https://arxiv.org/html/2603.00601v3)[/](https://arxiv.org/html/2603.00601v3)[html](https://arxiv.org/html/2603.00601v3)[/2603.00601](https://arxiv.org/html/2603.00601v3)[v](https://arxiv.org/html/2603.00601v3)[3](https://arxiv.org/html/2603.00601v3)]{.underline}

11. \[2603.00822\] ContextCov: Deriving and Enforcing Executable
    Constraints from Agent Instruction Files - arXiv, accessed April 22,
    2026,
    [[https](https://arxiv.org/abs/2603.00822)[://](https://arxiv.org/abs/2603.00822)[arxiv](https://arxiv.org/abs/2603.00822)[.](https://arxiv.org/abs/2603.00822)[org](https://arxiv.org/abs/2603.00822)[/](https://arxiv.org/abs/2603.00822)[abs](https://arxiv.org/abs/2603.00822)[/2603.00822](https://arxiv.org/abs/2603.00822)]{.underline}

12. Hound: Relation-First Knowledge Graphs for Complex-System Reasoning
    in Security Audits - arXiv, accessed April 22, 2026,
    [[https](https://arxiv.org/pdf/2510.09633)[://](https://arxiv.org/pdf/2510.09633)[arxiv](https://arxiv.org/pdf/2510.09633)[.](https://arxiv.org/pdf/2510.09633)[org](https://arxiv.org/pdf/2510.09633)[/](https://arxiv.org/pdf/2510.09633)[pdf](https://arxiv.org/pdf/2510.09633)[/2510.09633](https://arxiv.org/pdf/2510.09633)]{.underline}

13. Unleashing the Hound: How AI Agents Find Deep Logic Bugs in Any
    Codebase, accessed April 22, 2026,
    [[https](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[://](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[muellerberndt](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[.](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[medium](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[.](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[com](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[/](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[unleashing](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[-](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[the](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[-](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[hound](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[-](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[how](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[-](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[ai](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[-](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[agents](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[-](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[find](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[-](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[deep](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[-](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[logic](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[-](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[bugs](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[-](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[in](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[-](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[any](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[-](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[codebase](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[-64](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[c](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[2110](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[e](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[3](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[a](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[6](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)[f](https://muellerberndt.medium.com/unleashing-the-hound-how-ai-agents-find-deep-logic-bugs-in-any-codebase-64c2110e3a6f)]{.underline}

14. Hound: Relation-First Knowledge Graphs for Complex-System Reasoning
    in Security Audits, accessed April 22, 2026,
    [[https](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[://](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[www](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[.](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[researchgate](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[.](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[net](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[/](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[publication](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[/396458121\_](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[Hound](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[\_](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[Relation](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[-](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[First](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[\_](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[Knowledge](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[\_](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[Graphs](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[\_](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[for](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[\_](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[Complex](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[-](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[System](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[\_](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[Reasoning](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[\_](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[in](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[\_](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[Security](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[\_](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)[Audits](https://www.researchgate.net/publication/396458121_Hound_Relation-First_Knowledge_Graphs_for_Complex-System_Reasoning_in_Security_Audits)]{.underline}

15. code-yeongyu/oh-my-openagent: omo; the best agent harness -
    previously oh-my-opencode, accessed April 22, 2026,
    [[https](https://github.com/code-yeongyu/oh-my-openagent)[://](https://github.com/code-yeongyu/oh-my-openagent)[github](https://github.com/code-yeongyu/oh-my-openagent)[.](https://github.com/code-yeongyu/oh-my-openagent)[com](https://github.com/code-yeongyu/oh-my-openagent)[/](https://github.com/code-yeongyu/oh-my-openagent)[code](https://github.com/code-yeongyu/oh-my-openagent)[-](https://github.com/code-yeongyu/oh-my-openagent)[yeongyu](https://github.com/code-yeongyu/oh-my-openagent)[/](https://github.com/code-yeongyu/oh-my-openagent)[oh](https://github.com/code-yeongyu/oh-my-openagent)[-](https://github.com/code-yeongyu/oh-my-openagent)[my](https://github.com/code-yeongyu/oh-my-openagent)[-](https://github.com/code-yeongyu/oh-my-openagent)[openagent](https://github.com/code-yeongyu/oh-my-openagent)]{.underline}

16. oh-my-openagent/docs/guide/overview.md at dev - GitHub, accessed
    April 22, 2026,
    [[https](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[://](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[github](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[.](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[com](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[/](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[code](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[-](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[yeongyu](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[/](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[oh](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[-](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[my](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[-](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[openagent](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[/](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[blob](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[/](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[dev](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[/](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[docs](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[/](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[guide](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[/](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[overview](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[.](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)[md](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md)]{.underline}

17. orchestration.md - code-yeongyu/oh-my-openagent - GitHub, accessed
    April 22, 2026,
    [[https](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[://](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[github](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[.](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[com](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[/](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[code](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[-](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[yeongyu](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[/](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[oh](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[-](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[my](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[-](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[openagent](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[/](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[blob](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[/](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[dev](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[/](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[docs](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[/](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[guide](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[/](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[orchestration](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[.](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)[md](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/orchestration.md)]{.underline}

18. AI Coding Tools: The Complete Guide to Claude Code, OpenCode &
    Modern Development, accessed April 22, 2026,
    [[https](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[://](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[senrecep](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[.](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[medium](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[.](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[com](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[/](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[ai](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[-](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[coding](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[-](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[tools](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[-](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[the](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[-](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[complete](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[-](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[guide](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[-](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[to](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[-](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[claude](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[-](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[code](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[-](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[opencode](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[-](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[modern](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[-](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[development](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[-](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[eb](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[9](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[da](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[4477](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[dc](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)[1](https://senrecep.medium.com/ai-coding-tools-the-complete-guide-to-claude-code-opencode-modern-development-eb9da4477dc1)]{.underline}

19. accessed April 22, 2026,
    [[https](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[://](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[www](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[.](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[reddit](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[.](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[com](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[/](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[r](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[/](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[aipromptprogramming](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[/](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[comments](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[/1](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[qys](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[6](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[e](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[9/](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[we](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[\_](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[opensourced](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[\_](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[sbp](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[\_](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[a](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[\_](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[protocol](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[\_](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[that](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[\_](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[lets](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[\_](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[ai](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[\_](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[agents](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[/#:\~:](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[text](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[=](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[Brief](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[%2](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[DFeed](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[665-,](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[We](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[%20](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[open](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[%2](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[Dsourced](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[%20](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[SBP](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[%20%](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[E](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[2%80%94%20](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[a](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[%20](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[protocol](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[%20](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[that](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[%20](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[lets](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[%20](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[AI](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[%20](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[agents](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[,](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[signals](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[%20](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[instead](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[%20](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[of](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[%20](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[direct](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[%20](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[messaging](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[&](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[text](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[=](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[We](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[%20](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[just](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[%20](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[released](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[%20](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[SBP](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[%20(](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[Stigmergic](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[,](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[use](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[%20](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[orchestrators](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[%20](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[or](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[%20](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[message](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[%20](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[queues](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)[.](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/#:~:text=Brief%2DFeed665-,We%20open%2Dsourced%20SBP%20%E2%80%94%20a%20protocol%20that%20lets%20AI%20agents,signals%20instead%20of%20direct%20messaging&text=We%20just%20released%20SBP%20(Stigmergic,use%20orchestrators%20or%20message%20queues.)]{.underline}

20. We open-sourced SBP ---a protocol that lets AI agents coordinate
    through pheromone-like signals instead of direct messaging - Reddit,
    accessed April 22, 2026,
    [[https](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[://](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[www](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[.](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[reddit](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[.](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[com](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[/](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[r](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[/](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[aipromptprogramming](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[/](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[comments](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[/1](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[qys](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[6](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[e](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[9/](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[we](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[\_](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[opensourced](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[\_](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[sbp](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[\_](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[a](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[\_](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[protocol](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[\_](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[that](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[\_](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[lets](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[\_](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[ai](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[\_](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[agents](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[/](https://www.reddit.com/r/aipromptprogramming/comments/1qys6e9/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)]{.underline}

21. Multi-Agent Systems: Building the Autonomous Enterprise - Automation
    Anywhere, accessed April 22, 2026,
    [[https](https://www.automationanywhere.com/rpa/multi-agent-systems)[://](https://www.automationanywhere.com/rpa/multi-agent-systems)[www](https://www.automationanywhere.com/rpa/multi-agent-systems)[.](https://www.automationanywhere.com/rpa/multi-agent-systems)[automationanywhere](https://www.automationanywhere.com/rpa/multi-agent-systems)[.](https://www.automationanywhere.com/rpa/multi-agent-systems)[com](https://www.automationanywhere.com/rpa/multi-agent-systems)[/](https://www.automationanywhere.com/rpa/multi-agent-systems)[rpa](https://www.automationanywhere.com/rpa/multi-agent-systems)[/](https://www.automationanywhere.com/rpa/multi-agent-systems)[multi](https://www.automationanywhere.com/rpa/multi-agent-systems)[-](https://www.automationanywhere.com/rpa/multi-agent-systems)[agent](https://www.automationanywhere.com/rpa/multi-agent-systems)[-](https://www.automationanywhere.com/rpa/multi-agent-systems)[systems](https://www.automationanywhere.com/rpa/multi-agent-systems)]{.underline}

22. Multi-Agent Swarms and the Economics of Coordination Overhead \| by
    James Fahey, accessed April 22, 2026,
    [[https](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[://](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[medium](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[.](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[com](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[/@](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[fahey](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[\_](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[james](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[/](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[multi](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[-](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[agent](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[-](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[swarms](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[-](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[and](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[-](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[the](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[-](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[economics](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[-](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[of](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[-](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[coordination](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[-](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[overhead](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[-](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[da](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[8952](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[f](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[8](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[c](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[6](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[f](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)[1](https://medium.com/@fahey_james/multi-agent-swarms-and-the-economics-of-coordination-overhead-da8952f8c6f1)]{.underline}

23. Tracking Truth with Liquid Democracy - Daniel Halpern, accessed
    April 22, 2026,
    [[https](https://daniel-halpern.com/files/ld-journal.pdf)[://](https://daniel-halpern.com/files/ld-journal.pdf)[daniel](https://daniel-halpern.com/files/ld-journal.pdf)[-](https://daniel-halpern.com/files/ld-journal.pdf)[halpern](https://daniel-halpern.com/files/ld-journal.pdf)[.](https://daniel-halpern.com/files/ld-journal.pdf)[com](https://daniel-halpern.com/files/ld-journal.pdf)[/](https://daniel-halpern.com/files/ld-journal.pdf)[files](https://daniel-halpern.com/files/ld-journal.pdf)[/](https://daniel-halpern.com/files/ld-journal.pdf)[ld](https://daniel-halpern.com/files/ld-journal.pdf)[-](https://daniel-halpern.com/files/ld-journal.pdf)[journal](https://daniel-halpern.com/files/ld-journal.pdf)[.](https://daniel-halpern.com/files/ld-journal.pdf)[pdf](https://daniel-halpern.com/files/ld-journal.pdf)]{.underline}

24. New Paradigms in Social Choice - Harvard DASH, accessed April 22,
    2026,
    [[https](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[://](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[dash](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[.](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[harvard](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[.](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[edu](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[/](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[bitstreams](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[/7](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[f](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[78](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[d](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[41](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[b](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[-9850-41](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[b](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[8-800](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[e](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[-](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[ad](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[45](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[fb](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[8](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[fc](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[596/](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)[download](https://dash.harvard.edu/bitstreams/7f78d41b-9850-41b8-800e-ad45fb8fc596/download)]{.underline}

25. What Happens When Anyone Can Be Your Representative? Studying the
    Use of Liquid Democracy for High-Stakes Decisions in Online
    Platforms. - Andrew B. Hall, accessed April 22, 2026,
    [[https](https://andrewbenjaminhall.com/Hall_Miyazaki_Delegation.pdf)[://](https://andrewbenjaminhall.com/Hall_Miyazaki_Delegation.pdf)[andrewbenjaminhall](https://andrewbenjaminhall.com/Hall_Miyazaki_Delegation.pdf)[.](https://andrewbenjaminhall.com/Hall_Miyazaki_Delegation.pdf)[com](https://andrewbenjaminhall.com/Hall_Miyazaki_Delegation.pdf)[/](https://andrewbenjaminhall.com/Hall_Miyazaki_Delegation.pdf)[Hall](https://andrewbenjaminhall.com/Hall_Miyazaki_Delegation.pdf)[\_](https://andrewbenjaminhall.com/Hall_Miyazaki_Delegation.pdf)[Miyazaki](https://andrewbenjaminhall.com/Hall_Miyazaki_Delegation.pdf)[\_](https://andrewbenjaminhall.com/Hall_Miyazaki_Delegation.pdf)[Delegation](https://andrewbenjaminhall.com/Hall_Miyazaki_Delegation.pdf)[.](https://andrewbenjaminhall.com/Hall_Miyazaki_Delegation.pdf)[pdf](https://andrewbenjaminhall.com/Hall_Miyazaki_Delegation.pdf)]{.underline}

26. Programming languages - Lib.rs, accessed April 22, 2026,
    [[https](https://lib.rs/compilers)[://](https://lib.rs/compilers)[lib](https://lib.rs/compilers)[.](https://lib.rs/compilers)[rs](https://lib.rs/compilers)[/](https://lib.rs/compilers)[compilers](https://lib.rs/compilers)]{.underline}

27. We open-sourced SBP ---a protocol that lets AI agents coordinate
    through pheromone-like signals instead of direct messaging - Reddit,
    accessed April 22, 2026,
    [[https](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[://](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[www](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[.](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[reddit](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[.](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[com](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[/](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[r](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[/](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[mcp](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[/](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[comments](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[/1](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[qz](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[9](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[rrb](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[/](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[we](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[\_](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[opensourced](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[\_](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[sbp](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[\_](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[a](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[\_](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[protocol](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[\_](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[that](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[\_](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[lets](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[\_](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[ai](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[\_](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[agents](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)[/](https://www.reddit.com/r/mcp/comments/1qz9rrb/we_opensourced_sbp_a_protocol_that_lets_ai_agents/)]{.underline}
