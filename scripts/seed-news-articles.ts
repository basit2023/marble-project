import { existsSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { z } from "zod";

loadEnvConfig(process.cwd());

const uploadResultSchema = z.object({
  public_id: z.string(),
  secure_url: z.url(),
  format: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  bytes: z.number().int().positive(),
  version: z.number().int().positive(),
});

const articles = [
  {
    slug: "talal-chaudhry-concerns-proposed-kp-police-act-2026",
    title: "Talal Chaudhry Raises Concerns over Proposed KP Police Act 2026",
    excerpt: "The minister says changes to Khyber Pakhtunkhwa's police command structure could affect counterterrorism responsibilities and professional authority.",
    category: "Politics",
    tags: ["Talal Chaudhry", "KP Police Act 2026", "Khyber Pakhtunkhwa", "police reform", "counterterrorism"],
    image: "news-talal-kp-police-act.png",
    imageKey: "talal-kp-police-act-2026",
    altText: "Symbolic police cap and legal files representing debate over the proposed KP Police Act 2026",
    paragraphs: [
      "ISLAMABAD, September 24, 2026: Minister of State for Interior Senator Talal Chaudhry has raised objections to the proposed Khyber Pakhtunkhwa Police Act 2026, arguing that changes to the existing police command structure could have implications for the force's counterterrorism responsibilities and its professional chain of command.",
      "Speaking at a press conference in Islamabad on Thursday, Senator Talal Chaudhry said provincial governments were required to operate within the constitutional and legal framework and could not create separate military or police structures outside the established national system. He maintained that the rules governing the Police Service of Pakistan could not be altered in a manner inconsistent with the Constitution or applicable law.",
      "The minister's comments came a day after the Khyber Pakhtunkhwa cabinet approved a revised draft of the Police Act 2026, which is expected to be presented before the provincial assembly for consideration. The proposed legislation seeks to increase the provincial government's role in police policy, administration and certain senior-level appointments and transfers, while introducing changes to the institutional framework governing the provincial police.",
      "Senator Talal Chaudhry argued that the debate should not be viewed solely as an attempt to curtail the authority of the inspector general, saying the proposed legislation raised broader questions about the command and functioning of a police force that is responsible for counterterrorism operations. He questioned how officers could make professional decisions effectively if the established chain of command were substantially influenced by political authorities.",
      "The minister emphasized that the police require a clearly defined professional command structure, particularly in a province where security forces and law-enforcement agencies remain engaged in counterterrorism operations. He questioned whether officers facing security threats would look primarily to their professional police command or political representatives when making operational decisions.",
      "Chaudhry also maintained that provincial chief ministers already possessed mechanisms to consult on police appointments and issue directions within the existing legal framework, suggesting that additional changes to the command structure were not necessary to establish provincial oversight.",
      "The objections come as the KP government moves forward with its proposed amendments, which officials have presented as an effort to clarify the relationship between the provincial government's policy responsibilities and the police command's operational functions. The revised framework reportedly provides the provincial government with a greater role in senior appointments and transfers while retaining operational authority with the provincial police leadership.",
      "The proposed law also introduces institutional arrangements concerning police policy and planning, including a Police Policy Board that would deal with broader policy matters, while the provincial police chief would continue to oversee day-to-day operations. The draft further proposes changes to recruitment and dispute-resolution mechanisms within the provincial policing system.",
      "The legislation will now enter the provincial assembly's legislative process, where its provisions can be examined and debated before any final enactment. The disagreement between the federal interior ministry and the KP government reflects a broader institutional discussion over provincial administrative authority, police autonomy and the command structure required for effective counterterrorism operations.",
      "As the draft moves to the assembly, further debate is expected over the constitutional position of the Police Service of Pakistan, the authority of the provincial government over policing matters and the balance between elected-government oversight and professional operational command.",
    ],
  },
  {
    slug: "19-terrorists-killed-balochistan-operations-ispr",
    title: "19 Terrorists Killed in Balochistan Operations: ISPR",
    excerpt: "Security forces killed 19 terrorists in operations across Balochistan, while Subedar Muhammad Jamil embraced martyrdom, according to ISPR.",
    category: "Security",
    tags: ["Balochistan", "ISPR", "security forces", "counterterrorism", "Azm-e-Istehkam"],
    image: "news-balochistan-operations.png",
    imageKey: "balochistan-security-operations",
    altText: "Security patrol overlooking rugged Balochistan mountain terrain at dawn",
    paragraphs: [
      "September 24, 2026: Security forces have killed 19 terrorists in separate intelligence-based and clearance operations conducted across Balochistan, while a Pakistan Army soldier embraced martyrdom during an exchange of fire, according to the Inter-Services Public Relations (ISPR).",
      "According to the military's media wing, a clearance operation has been underway in the Shaban area of Quetta district since September 21 after intelligence agencies identified multiple terrorist hideouts posing a threat to the local population. Security forces engaged the militants and cleared several hideouts during the operation, resulting in the killing of 13 terrorists, while weapons, ammunition and explosives were also recovered.",
      "The ISPR said the operation in Shaban would continue until the complete neutralisation of the identified threat, with security forces maintaining efforts to clear the area and dismantle militant infrastructure. The operation was launched as part of measures aimed at protecting local communities and preventing terrorist elements from establishing positions in the area.",
      "In separate engagements conducted on September 22 and 23, security forces carried out pre-emptive intelligence-based operations in Kech and Quetta West districts, where troops engaged terrorists following actionable intelligence. Six terrorists were killed during intense exchanges of fire, while weapons and ammunition were recovered from the sites, according to the ISPR.",
      "During one of the engagements, Subedar Muhammad Jamil, 39, a resident of Taunsa Sharif in Dera Ghazi Khan district, embraced martyrdom while performing his duty. The military paid tribute to his sacrifice as part of the continuing counterterrorism efforts in the province.",
      "The latest operations form part of the ongoing counterterrorism campaign being conducted under the vision of Azm-e-Istehkam, with the security forces and law-enforcement agencies maintaining operations against militant networks across the country. The ISPR reaffirmed that efforts would continue to address terrorist threats and protect the lives and property of citizens.",
      "President Asif Ali Zardari and Prime Minister Muhammad Shehbaz Sharif separately commended the security forces for the operations and paid tribute to Subedar Muhammad Jamil for his sacrifice. The prime minister also expressed solidarity with the soldier's family and reiterated the government's resolve to continue counterterrorism efforts.",
      "The latest developments come amid continued security operations in Balochistan, where authorities have intensified intelligence-based actions against militant groups and sought to disrupt their ability to target civilians, security personnel and key infrastructure.",
    ],
  },
  {
    slug: "kp-cabinet-amended-police-act-2026-oversight-framework",
    title: "KP Cabinet Approves Amended Police Act 2026 with Revised Police Oversight Framework",
    excerpt: "The amended framework changes senior police appointments, policy oversight and dispute-resolution mechanisms in Khyber Pakhtunkhwa.",
    category: "Politics",
    tags: ["KP Cabinet", "Police Act 2026", "police oversight", "Khyber Pakhtunkhwa", "Sohail Afridi"],
    image: "news-kp-police-act-cabinet.png",
    imageKey: "kp-cabinet-police-act-2026",
    altText: "Provincial cabinet meeting room with policy folders representing the amended KP Police Act 2026",
    paragraphs: [
      "PESHAWAR, September 24, 2026: The Khyber Pakhtunkhwa cabinet has approved the amended Khyber Pakhtunkhwa Police Act 2026, introducing changes to the appointment and transfer of senior police officers, provincial oversight of police policy and the functioning of dispute resolution mechanisms across the province. The revised draft was approved during the cabinet's 59th meeting chaired by Chief Minister Muhammad Sohail Afridi.",
      "The legislation seeks to establish a clearer institutional framework between police policy and operational matters, while giving the provincial government a greater role in senior-level administrative decisions. Under the approved provisions, appointments and transfers of police officers in Grade 18 and above will be dealt with under the Khyber Pakhtunkhwa Rules of Business 1985, while the chief minister will also have authority regarding the appointment of district police officers.",
      "A key provision of the amended framework relates to the Police Policy Board, which will be headed by the chief minister and will oversee broader policy and planning matters concerning the provincial police. The annual provincial policing plan will also be presented before the board for consideration and approval, providing an institutional mechanism for setting policing priorities and reviewing performance. At the same time, operational authority will remain with the provincial police chief, maintaining a distinction between policy direction and day-to-day police operations.",
      "The amended law also provides a mechanism through which the provincial government can seek the repatriation of the provincial police officer in cases of unsatisfactory performance or misconduct, subject to the applicable legal procedure and federal government involvement. The existing procedure for appointment of the Inspector General of Police, however, remains in place according to details released following the cabinet meeting.",
      "The legislation further proposes a 25 percent direct recruitment quota at the Deputy Superintendent of Police level, alongside changes intended to provide a more structured framework for recruitment and career progression within the police service. The government has described these provisions as part of broader efforts to strengthen professional capacity and institutional accountability within the provincial police force.",
      "Another important component of the revised Police Act concerns the Dispute Resolution Councils. Existing DRCs are to be dissolved and reconstituted under a new legal framework designed to establish clearer and more uniform procedures for their formation and functioning throughout Khyber Pakhtunkhwa.",
      "Provincial Information Minister Shafi Jan said the revised legislation was finalized after a cabinet subcommittee reviewed the proposed law and consulted relevant police authorities before presenting its recommendations to the cabinet. The cabinet subsequently considered the recommendations along with additional proposals and approved the amended draft.",
      "The approved draft will now proceed to the Khyber Pakhtunkhwa Assembly for further legislative consideration. The proposed changes have also generated debate over the balance between elected-government oversight and police autonomy, with KP Governor Faisal Karim Kundi publicly raising constitutional concerns about the legislation and indicating that he would object to the law in its current form if it is formally sent to him for approval.",
      "The Police Act 2026 therefore represents a significant proposed restructuring of the province's policing framework, with its final shape dependent on the legislative process and any subsequent constitutional or legal review.",
    ],
  },
  {
    slug: "ishaq-dar-iranian-fm-dialogue-regional-stability",
    title: "Ishaq Dar, Iranian FM Reaffirm Commitment to Dialogue and Regional Stability",
    excerpt: "Pakistan and Iran's foreign ministers reviewed bilateral ties and agreed to maintain close contact on regional and international developments.",
    category: "International",
    tags: ["Ishaq Dar", "Seyed Abbas Araghchi", "Pakistan Iran relations", "UN General Assembly", "diplomacy"],
    image: "news-pakistan-iran-dialogue.png",
    imageKey: "pakistan-iran-dialogue",
    altText: "Pakistan and Iran flags across a diplomatic meeting table in New York",
    paragraphs: [
      "NEW YORK, September 24, 2026: Deputy Prime Minister and Foreign Minister Senator Mohammad Ishaq Dar held a meeting with Iranian Foreign Minister Seyed Abbas Araghchi on the sidelines of the 81st Session of the United Nations General Assembly in New York, with the two sides reviewing bilateral relations and exchanging views on regional and international developments.",
      "The meeting provided an opportunity for Pakistan and Iran to maintain close diplomatic coordination at a time when developments across the region continue to require sustained engagement and constructive communication between neighbouring countries. According to the Foreign Office, Senator Mohammad Ishaq Dar underscored the importance of dialogue, diplomacy and continued engagement as essential means of promoting peace and stability in the region.",
      "The two foreign ministers also discussed matters of mutual interest in the context of evolving regional and international developments, while reaffirming the importance of maintaining regular diplomatic contacts between Islamabad and Tehran. Both sides agreed to remain in close contact, reflecting their shared interest in keeping channels of communication open and strengthening coordination on issues affecting regional peace and stability.",
      "The meeting comes amid continued diplomatic activity on the sidelines of the UN General Assembly, where regional security, conflict resolution and efforts to promote dialogue have remained among the key issues under discussion. Pakistan has continued to emphasize diplomacy and sustained engagement in addressing regional challenges, with Senator Mohammad Ishaq Dar maintaining contacts with counterparts in the region as part of Islamabad's broader diplomatic outreach.",
      "The latest meeting also follows recent communication between Senator Mohammad Ishaq Dar and Seyed Abbas Araghchi, during which the Pakistani foreign minister stressed the importance of uninterrupted energy supplies and the safe passage of ships, while emphasizing dialogue and diplomacy as means of supporting regional peace and stability.",
      "The engagement between the two foreign ministers underscores the importance Islamabad attaches to maintaining constructive relations with Tehran and ensuring continued diplomatic coordination on developments that have implications for Pakistan, Iran and the wider region. Both sides' decision to remain in close contact is expected to provide a channel for continued consultations as regional circumstances evolve.",
    ],
  },
  {
    slug: "pm-shehbaz-pakistan-eu-partnership-gsp-plus-engagement",
    title: "PM Shehbaz Reaffirms Pakistan's Commitment to Strengthening EU Partnership and GSP+ Engagement",
    excerpt: "Prime Minister Shehbaz Sharif emphasized sustained EU engagement, implementation of the Strategic Engagement Plan and continued GSP+ cooperation.",
    category: "Economy",
    tags: ["Shehbaz Sharif", "European Union", "GSP Plus", "Pakistan EU relations", "trade"],
    image: "news-pakistan-eu-gsp.png",
    imageKey: "pakistan-eu-gsp-engagement",
    altText: "Pakistan and European Union flags beside trade documents, textiles and a shipping container",
    paragraphs: [
      "NEW YORK, September 24, 2026: Prime Minister Muhammad Shehbaz Sharif has reaffirmed Pakistan's commitment to sustained engagement with the European Union and continued cooperation under the Generalised Scheme of Preferences Plus (GSP+), highlighting the importance of strengthening the broad-based partnership between Islamabad and Brussels through regular high-level dialogue and practical cooperation.",
      "The prime minister made these remarks during a meeting with European Council President António Luís Santos da Costa and European Commission President Ursula von der Leyen on the sidelines of the 81st session of the United Nations General Assembly in New York, where the leaders reviewed the full spectrum of Pakistan-EU relations and discussed regional and global developments.",
      "According to the Prime Minister's Office, the leaders expressed satisfaction over the growing momentum in high-level contacts between Pakistan and the European Union, while Prime Minister Muhammad Shehbaz Sharif emphasized that sustained leadership-level engagement would provide greater direction to bilateral relations and help identify new avenues for mutually beneficial cooperation.",
      "The prime minister reiterated Pakistan's commitment to further strengthening its partnership with the European Union and ensuring the full implementation of the Pakistan-EU Strategic Engagement Plan, while stressing the importance of continued dialogue, diplomacy, respect for international law and the peaceful resolution of disputes.",
      "Prime Minister Muhammad Shehbaz Sharif also renewed his invitation to the presidents of the European Council and European Commission to visit Pakistan, expressing his desire to work closely with European leadership to further expand cooperation across areas of shared interest.",
      "The meeting comes at an important stage in Pakistan-EU economic relations, particularly as Islamabad seeks continued engagement with the European bloc over the future of its GSP+ trade preferences. The existing GSP+ framework is scheduled to expire at the end of 2026, while Pakistan and other beneficiaries will enter a transition period under the EU's successor trading arrangement through December 2028.",
      "The GSP+ framework links enhanced trade preferences with commitments relating to international conventions on human rights, labour rights, environmental protection and good governance. The European Commission's latest assessment has highlighted areas where Pakistan faces compliance challenges, making continued engagement and progress on relevant commitments an important component of discussions between Islamabad and Brussels.",
      "The discussions also followed the signing of €65 million in financing agreements between Pakistan and the European Union earlier this week to support investments under the EU's Global Gateway initiative, strengthen the rule of law and business environment, and improve energy and environmental resilience.",
      "European Commission President Ursula von der Leyen described her meeting with Prime Minister Muhammad Shehbaz Sharif as productive and said the EU valued its partnership with Pakistan. She noted that discussions covered ways to advance cooperation, including trade and efforts to address irregular migration, while also acknowledging Pakistan's role in supporting dialogue and de-escalation efforts concerning regional conflicts.",
      "Pakistan's engagement with European institutions has also continued at the foreign ministerial level, with Deputy Prime Minister and Foreign Minister Senator Mohammad Ishaq Dar holding discussions with EU High Representative for Foreign Affairs and Security Policy Kaja Kallas on the importance of GSP+ for Pakistan's trade relationship with the European Union.",
      "Alongside his engagement with EU leaders, Prime Minister Muhammad Shehbaz Sharif also met International Monetary Fund Managing Director Kristalina Georgieva, where he reiterated his government's commitment to implementing the IMF-supported reform programme and maintaining economic reform momentum.",
      "The prime minister said Pakistan was moving from macroeconomic stabilisation towards a recovery path, supported by fiscal discipline, prudent monetary policies, stronger external buffers and measures aimed at improving investor confidence. He also highlighted progress in areas including tariff reforms, domestic revenue mobilisation and privatisation.",
      "The parallel diplomatic and economic engagements in New York reflect Pakistan's efforts to deepen relations with key international partners while advancing trade, investment and economic reforms. With GSP+ remaining an important component of Pakistan's exports to the European market, continued dialogue with the EU is expected to remain a significant priority as Islamabad works to strengthen its economic partnership with Brussels and advance broader bilateral cooperation.",
    ],
  },
] as const;

function html(paragraphs: readonly string[]) {
  return paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");
}

function seo(title: string, excerpt: string) {
  return {
    metaTitle: title.slice(0, 60),
    metaDescription: excerpt.slice(0, 160),
    keywords: [],
    noIndex: false,
  };
}

async function cloudinaryTimestamp(cloudName: string) {
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "HEAD", cache: "no-store" }).catch(() => null);
  const header = response?.headers.get("date");
  const parsed = header ? Date.parse(header) : Number.NaN;
  return Number.isFinite(parsed) ? Math.floor(parsed / 1000) : Math.floor(Date.now() / 1000);
}

async function main() {
  const { connectDB } = await import("../src/lib/db");
  const { env } = await import("../src/lib/env");
  const { cloudinary } = await import("../src/lib/cloudinary");
  const { generateBlurDataUrl } = await import("../src/lib/media/cloud");
  const { hashPassword } = await import("../src/lib/password");
  const { User, Media, BlogPost, AuditLog } = await import("../src/models");
  const db = await connectDB();

  try {
    let author = await User.findOne({ name: "Syda Manal", isDeleted: false });
    if (!author) {
      author = await User.create({
        name: "Syda Manal",
        email: "syda-manal-editorial@example.invalid",
        passwordHash: await hashPassword(randomUUID() + randomUUID()),
        role: "editor",
        forcePasswordChange: true,
        isActive: true,
        isDeleted: false,
        sortOrder: 0,
        createdBy: null,
        updatedBy: null,
      });
    }

    const timestamp = await cloudinaryTimestamp(env.CLOUDINARY_CLOUD_NAME);

    for (const [sortOrder, article] of articles.entries()) {
      const publicId = `marble-site/blog/${article.imageKey}`;
      let media = await Media.findOne({ cloudinaryPublicId: publicId, isDeleted: false });

      if (!media) {
        const assetPath = path.join(process.cwd(), "seed-assets", "generated", article.image);
        if (!existsSync(assetPath)) throw new Error(`Missing generated image: ${assetPath}`);
        const raw = await cloudinary.uploader.upload(assetPath, {
          folder: "marble-site/blog",
          public_id: article.imageKey,
          overwrite: true,
          resource_type: "image",
          timestamp,
          transformation: [{ crop: "limit", width: 2560, flags: "strip_profile" }],
        });
        const upload = uploadResultSchema.parse(raw);
        media = await Media.create({
          cloudinaryPublicId: upload.public_id,
          secureUrl: upload.secure_url,
          format: upload.format,
          width: upload.width,
          height: upload.height,
          bytes: upload.bytes,
          version: upload.version,
          blurDataUrl: await generateBlurDataUrl(upload.public_id, upload.version),
          altText: article.altText,
          caption: `AI-generated editorial illustration for: ${article.title}`,
          title: article.title,
          folder: "marble-site/blog",
          tags: ["ai-generated", "editorial", "news", article.category.toLowerCase()],
          usageContext: "blog",
          uploadedBy: author._id,
          isActive: true,
          isDeleted: false,
          sortOrder,
          createdBy: author._id,
          updatedBy: author._id,
        });
        await AuditLog.create({ user: author._id, action: "upload", collectionName: "Media", documentId: media._id, changes: { source: "seed-news-articles" } });
      } else {
        media.set({ altText: article.altText, title: article.title, isActive: true, updatedBy: author._id });
        await media.save();
      }

      const payload = {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: html(article.paragraphs),
        coverImage: media._id,
        author: author._id,
        category: article.category,
        tags: [...article.tags],
        readTimeMinutes: 1,
        publishedAt: new Date("2026-09-24T00:00:00.000Z"),
        isPublished: true,
        viewCount: 0,
        seo: seo(article.title, article.excerpt),
        isActive: true,
        isDeleted: false,
        sortOrder,
        createdBy: author._id,
        updatedBy: author._id,
      };
      const post = await BlogPost.findOne({ slug: article.slug, isDeleted: false });
      const action = post ? "update" : "create";
      const saved = post ?? new BlogPost(payload);
      if (post) saved.set({ ...payload, createdBy: post.createdBy ?? author._id });
      await saved.save();
      await AuditLog.create({ user: author._id, action, collectionName: "BlogPost", documentId: saved._id, changes: { source: "seed-news-articles", category: article.category } });
    }

    await Promise.all([Media.createIndexes(), BlogPost.createIndexes()]);
    console.info(`Published ${articles.length} articles by Syda Manal with AI-generated Cloudinary cover images.`);
  } finally {
    await db.disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? `${error.name}: ${error.message}` : "News article seed failed.");
  process.exitCode = 1;
});
