---
alwaysApply: true
---

# AGENTS.md

## About this repo

This repo use Tauri 2, Svelte 5, and TypeScript in Vite. Always check if the repo use SvelteKit or not.

Use `pnpm` in this project.

## Checklist

When writing code or editing code, **ALWAYS** check this:
1. Make sure there are no similar code parts that can be used here. Do not write the same or similar features more than 1 time.
2. Make sure the files are well-organized. Do not write a file too long, or split a feature into too many files. Check the exist file structure when you want to create a new one.
3. Make sure the code style are consistent with other code. Use comments correctly. Comments must be in English, and should not be added if the user asks to make a modification.
4. Make sure the design is consistent. The design principle is light, neat, with not too much colors. Make sure the components are easy to transfer in the future, just like, the user may want to change the design to ShadCN UI later.

## Svelte MCP server

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
